import { type ComponentType } from 'preact';

import { UrlUtils } from './url-utils.namespace';
import { type RouteChainResult } from '../components/router-outlet.component';
import { type Route } from '../types';

export function resolveRouteChain(
  routes: Route[],
  component?: ComponentType,
  basePath: string = '',
  level: number = 0,
): RouteChainResult | undefined {
  if (!component) {
    return { basePath, chain: routes, level };
  }

  for (const r of routes) {
    if (r.component === component) {
      return {
        basePath: UrlUtils.joinPath(basePath, r.path),
        chain: r.children || [],
        level: level + 1,
      };
    }

    if (r.children) {
      const childBasePath = UrlUtils.joinPath(basePath, r.path);
      const childLevel = level + 1;

      const result = resolveRouteChain(r.children, component, childBasePath, childLevel);

      if (result) {
        return result;
      }
    }
  }
}
