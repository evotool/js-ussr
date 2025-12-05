import { observer } from 'mobx-react';
import { type ComponentType, type FunctionComponent } from 'preact';
import { useEffect } from 'preact/hooks';

import { ErrorPage } from './error-page.component';
import { HttpException } from '../classes/http-exception.class';
import { useRouter } from '../hooks/use-router.hook';
import { type Route } from '../types';

export const RouterOutlet: FunctionComponent<RouterOutletProps> = observer((props) => {
  const { errorPage, parent } = props;

  const router$ = useRouter();
  const { url, routeChain, data, notFound } = router$.snapshot;

  useEffect(() => {
    if (router$.snapshot.fragment) {
      const el = document.getElementById(router$.snapshot.fragment);

      if (el) {
        requestAnimationFrame(() => {
          scrollTo(0, el.offsetTop);
        });

        return;
      }
    }

    scrollTo(0, 0);
  }, [router$.snapshot]);

  if (!parent) {
    const FallbackComponent = errorPage || ErrorPage;

    if (notFound) {
      return <FallbackComponent error={new HttpException('Route not found', 404)} />;
    }

    const routeDataWithError = data.find((d) => d.error);

    if (routeDataWithError) {
      return <FallbackComponent error={routeDataWithError.error!} />;
    }

    const hasRedirectError = routeChain.some((r) => r.redirectTo && r.redirectTo === url);

    if (hasRedirectError) {
      return <FallbackComponent error={new HttpException('Bad route (CURRENT_PAGE_REDIRECT)')} />;
    }

    const hasNoComponentError =
      routeChain.every((r) => !r.redirectTo) && routeChain.some((r) => !r.component);

    if (hasNoComponentError) {
      return <FallbackComponent error={new HttpException('Bad route (NO_COMPONENT)')} />;
    }
  }

  const parentRouteIndex = parent ? routeChain.findIndex((r) => r.component === parent) : -1;
  const routeIndex = parentRouteIndex + 1;
  const route = routeChain[routeIndex];
  const routeData = data[routeIndex];

  if (route.redirectTo) {
    void router$
      .navigate(
        route.redirectTo.startsWith('/')
          ? route.redirectTo
          : `${url.replace(/\/$/, '')}/${route.redirectTo}`,
      )
      .catch(console.error);

    return null;
  }

  const RouteComponent = route.component!;

  return <RouteComponent {...routeData.payload} />;
});

export interface RouterOutletProps {
  errorPage?: ComponentType<{ error: Error }>;
  parent?: ComponentType<any>;
}

export interface RouteChainResult {
  basePath: string;
  chain: Route[];
  level: number;
}
