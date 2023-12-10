import { readFileSync } from 'fs';
import { join } from 'path';
import { type LegacyValue, types } from 'sass';

export function encodeSvg(data: string, encodeColors?: boolean): string {
  if (data.includes('"')) {
    data = data.replace(/"/g, '\'');
  }

  data = data
    .replace(/>\s+</g, '><')
    .replace(/\s{2,}/g, ' ')
    .replace(/[\r\n"%#()<>?[\\\]^`{|}]/g, encodeURIComponent);

  if (encodeColors) {
    data = data.replace(/'\$([^']*)'/g, '\'%23#{str-slice(inspect($$$1),2)}\'');
  }

  return data;
}

export function svgSass(pwd: string): {
  [sassFn: string]: (svgFileName: types.String, mapping: types.Map) => LegacyValue;
} {
  return {
    'svg($filename, $mapping: ())'(filenameArg: types.String, mapArg: types.Map) {
      const filename = filenameArg.getValue();
      const filepath = join(pwd, filename);

      let svg = readFileSync(filepath, 'utf8');
      svg = encodeSvg(svg);

      if (mapArg instanceof types.Map) {
        for (let i = 0, l = mapArg.getLength(); i < l; i++) {
          const key = (mapArg.getKey(i) as any).getValue();
          const value = `${mapArg.getValue(i) as any}`;

          svg = svg.replaceAll(`'$${key}'`, `'${encodeURIComponent(value)}'`);
        }
      }

      return new types.String(`url("data:image/svg+xml,${svg}")`);
    },
  };
}
