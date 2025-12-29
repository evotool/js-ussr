import { readFileSync } from 'fs';
import { join } from 'path';
import { SassMap, SassString, type Value } from 'sass';

export function encodeSvg(data: string, encodeColors?: boolean): string {
  if (data.includes('"')) {
    data = data.replace(/"/g, `'`);
  }

  data = data
    .replace(/>\s+</g, '><')
    .replace(/\s{2,}/g, ' ')
    .replace(/[\r\n"%#()<>?[\\\]^`{|}]/g, encodeURIComponent);

  if (encodeColors) {
    data = data.replace(/'\$([^']*)'/g, `'%23#{str-slice(inspect($$$1),2)}'`);
  }

  return data;
}

export function svgSass(pwd: string): {
  [sassFn: string]: (args: Value[]) => Value;
} {
  return {
    'svg($filename, $mapping: ())'(args: Value[]): Value {
      const [sassFilename, sassMap] = args as [sassFilename: SassString, sassMap: SassMap];

      const filename = sassFilename.text;
      const filepath = join(pwd, filename);

      let svg = readFileSync(filepath, 'utf8');

      svg = encodeSvg(svg);

      if (!(sassMap instanceof SassMap)) {
        return new SassString(`url("data:image/svg+xml,${svg}")`, {
          quotes: false,
        });
      }

      const contents = sassMap.contents as Immutable.OrderedMap<SassString, SassString>;

      for (const [sassKey, sassValue] of contents) {
        if (!(sassValue instanceof SassString)) {
          continue;
        }

        const key = sassKey.text;
        const value = sassValue.text;

        svg = svg.replaceAll(`'$${key}'`, `'${encodeURIComponent(value)}'`);
      }

      return new SassString(`url("data:image/svg+xml,${svg}")`);
    },
  };
}
