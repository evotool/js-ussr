import { type Container } from 'inversify';

import { RouteData } from './route-data.class';
import { UrlUtils } from '../functions/url-utils.namespace';
import { type Params, type QueryParams, type Route } from '../types';

export class RouteSnapshot {
  readonly data: RouteData[] = [];

  constructor(
    readonly url: string,
    readonly path: string,
    readonly params: Params,
    readonly queryParams: QueryParams,
    readonly fragment: string,
    readonly routeChain: Route[],
    readonly notFound: boolean = false,
  ) {}

  async resolveData(container: Container): Promise<RouteData[]> {
    const data = await Promise.all(
      this.routeChain.map((r) =>
        Promise.resolve(r.resolve?.call(this, container) || {}).then(
          (data) => RouteData.success(data),
          (err) => RouteData.fail(err),
        )),
    );

    this.data.length = 0;
    this.data.push(...data);

    return this.data;
  }

  static fromUrl(url: string, routes: Route[]): RouteSnapshot {
    const routeChain: Route[] = [];

    const [urlPathWithQuery, fragment = ''] = url.split('#', 2);
    const [urlPath, urlQuery = ''] = urlPathWithQuery.split('?', 2);

    let route: Route | undefined,
      path = '',
      params: Params | undefined;

    let notFound = false;

    do {
      let fullRoutePath = '/';

      route = routes.find((r) => {
        fullRoutePath = UrlUtils.joinPath(path, r.path);

        const fullMatch = !r.children;
        const match = UrlUtils.paramify(fullRoutePath, fullMatch);

        params = match(urlPath);

        return params;
      });

      if (!route) {
        notFound = true;

        break;
      }

      routeChain.push(route);
      path = fullRoutePath;

      if (!route.children) {
        break;
      }

      routes = route.children;
      // eslint-disable-next-line no-constant-condition
    } while (true);

    const queryParams = UrlUtils.parseQuery(urlQuery);

    const routeSnapshot = new RouteSnapshot(
      url,
      path,
      params || {},
      queryParams,
      fragment,
      routeChain,
      notFound,
    );

    return routeSnapshot;
  }
}
