import { load } from 'cheerio';
import { type ComponentType } from 'preact';
import { render } from 'preact-render-to-string';

import { type ServerOptions, createContainer } from './create-container.function';
import { HeadManager } from '../classes/head-manager.class';
import { Router } from '../classes/router.class';
import { ErrorPage } from '../components/error-page.component';
import { RouterOutlet } from '../components/router-outlet.component';
import { ContainerContext } from '../contexts/container.context';
import { type Provider, type Route, type Type } from '../types';

const HTML_TEMPLATE = `<!DOCTYPE html>
<html lang="ru">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="stylesheet" href="/app.css">
  </head>
  <body>
    <div id="root"></div>
    <script src="/app.js" defer></script>
  </body>
</html>
`
  .split(/\n\s*/)
  .join('');

export async function renderForServer(
  routes: Route[],
  providers: (Provider | Type)[] = [],
  options: ServerRenderOptions,
): Promise<Buffer> {
  const container = createContainer(routes, providers, options);
  const router = container.get(Router);

  const { errorPage: ErrorPageComponent = ErrorPage } = options;
  let renderedHtml = '';

  try {
    await router.resolveDataForServer();

    renderedHtml = render(
      <ContainerContext.Provider value={container}>
        <RouterOutlet errorPage={ErrorPageComponent} />
      </ContainerContext.Provider>,
    );
  } catch (error: any) {
    renderedHtml = render(
      <ContainerContext.Provider value={container}>
        <ErrorPageComponent error={error} />
      </ContainerContext.Provider>,
    );
  }

  const $ = load(HTML_TEMPLATE);
  const headManager = container.get(HeadManager);

  $('#root').html(renderedHtml);
  $('head').append(headManager.html());
  $('body').append(`<script>window.__HYDRATED=${JSON.stringify(router.snapshot.data)}</script>`);

  return Buffer.from($.html(), 'utf-8');
}

export interface ServerRenderOptions extends ServerOptions {
  errorPage?: ComponentType<{ error: Error }>;
}
