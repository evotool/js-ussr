import { type Params, type QueryParams } from '../types';

const PATH_REGEX = /^[a-z0-9_-]+$/i;
const PATH_PARAM_REGEX = /^:([a-z_][a-z0-9_]+)(?:\((.*)\))?$/i;

export namespace UrlUtils {
  export function joinPath(...paths: string[]): string {
    return `/${paths
      .map((p) => p.split('/'))
      .flat()
      .filter(Boolean)
      .join('/')}`;
  }

  export function parseQuery(querystring: string): QueryParams {
    const query = {};
    const searchParams = new URLSearchParams(querystring);

    for (const [key, value] of searchParams) {
      if (query[key]) {
        query[key] = [query[key], value].flat();
      } else {
        query[key] = value;
      }
    }

    return query;
  }

  export function buildQuery(queryParams: BuildQueryParams): string {
    const searchParams = new URLSearchParams();

    for (const [key, value] of Object.entries(queryParams)) {
      if (Array.isArray(value)) {
        for (const v of value) {
          searchParams.append(key, `${v}`);
        }
      } else if (value !== undefined) {
        searchParams.append(key, `${value}`);
      }
    }

    return searchParams.toString();
  }

  export interface BuildQueryParams {
    [key: string]: string | number | boolean | (string | number | boolean)[] | undefined;
  }

  export function paramify(path: string, fullMatch?: boolean): (url: string) => Params | undefined {
    const pathParts = path.split('/').filter(Boolean);

    return (url: string) => {
      const [urlPath, search = ''] = url.split('?');
      const urlParts = urlPath.split('/').filter(Boolean);

      if (
        urlParts.length < pathParts.length ||
        (fullMatch && urlParts.length !== pathParts.length)
      ) {
        return;
      }

      const params: Params = {};

      for (let i = 0; i < urlParts.length; i++) {
        if (i >= pathParts.length) {
          break;
        }

        const rp = pathParts[i];
        const up = urlParts[i];

        if (PATH_REGEX.test(rp)) {
          if (rp.toLowerCase() === up.toLowerCase()) {
            continue;
          }

          return;
        }

        const [, key, regex] = Array.from(PATH_PARAM_REGEX.exec(rp) || []);

        if (regex) {
          const r = new RegExp(`^${regex}$`, 'i');

          if (!r.test(up)) {
            return;
          }
        }

        params[key] = up;
      }

      Object.assign(params, parseQuery(search));

      return params;
    };
  }
}
