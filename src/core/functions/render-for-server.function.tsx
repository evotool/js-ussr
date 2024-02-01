import { type ComponentType } from 'preact';
import { renderToString } from 'preact-render-to-string';

import { type ServerOptions, createContainer } from './create-container.function';
import { HeadManager } from '../classes/head-manager.class';
import { type RouteData } from '../classes/route-data.class';
import { Router } from '../classes/router.class';
import { ErrorPage } from '../components/error-page.component';
import { RouterOutlet } from '../components/router-outlet.component';
import { ContainerContext } from '../contexts/container.context';
import { type Provider, type Route, type Type } from '../types';

const renderHtml = (
  head: string,
  root: string,
  routeData: RouteData<{ [key: string]: any }>[],
  lang: string = 'en',
  version: string = '0',
): string =>
  [
    `<!DOCTYPE html><html lang="`,
    lang,
    `"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/app.css?v=`,
    version,
    `">`,
    head,
    `</head><body><div id="root">`,
    root,
    `</div><script defer src="/vendor.js?v=`,
    version,
    `"></script><script defer src="/app.js?v=`,
    version,
    `"></script>`,
    `<script>window.$_DATA=`,
    JSON.stringify(routeData),
    `;</script>`,
    `</body></html>`,
  ].join('');

export async function renderForServer(
  routes: Route[],
  providers: (Provider | Type)[] = [],
  options: ServerRenderOptions,
): Promise<Buffer> {
  const container = createContainer(routes, providers, options);
  const router = container.get(Router);

  const { errorPage: ErrorPageComponent = ErrorPage, lang, version } = options;
  let body = '';

  const destroyCollection = container.get<(() => void | Promise<void>)[]>('destroy_collection');

  try {
    await router.resolveDataForServer();

    body = renderToString(
      <ContainerContext.Provider value={container}>
        <RouterOutlet errorPage={ErrorPageComponent} />
      </ContainerContext.Provider>,
    );
  } catch (error: any) {
    body = renderToString(
      <ContainerContext.Provider value={container}>
        <ErrorPageComponent error={error} />
      </ContainerContext.Provider>,
    );
  }

  await Promise.all(destroyCollection.map(async (fn) => fn()).map((r) => r.catch(console.error)));

  const headManager = container.get(HeadManager);

  const head = headManager.html();
  const routeData = router.snapshot.data;

  const html = renderHtml(head, body, routeData, lang, version);

  return Buffer.from(html, 'utf-8');
}

export interface ServerRenderOptions extends ServerOptions {
  errorPage?: ComponentType<{ error: Error }>;

  /**
   * @default 'en'
   */
  lang?: string;

  /**
   * @default '0'
   */
  version?: string;
}
