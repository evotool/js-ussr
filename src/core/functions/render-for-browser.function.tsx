import { type ComponentType, render } from 'preact';

import { createContainer } from './create-container.function';
import { RouterOutlet } from '../components/router-outlet.component';
import { ContainerContext } from '../contexts/container.context';
import { type Provider, type Route, type Type } from '../types';

export function renderForBrowser(
  routes: Route[],
  providers: (Provider | Type)[] = [],
  options: BrowserRenderOptions = {},
): void {
  const { errorPage } = options;
  const container = createContainer(routes, providers);

  render(
    <ContainerContext.Provider value={container}>
      <RouterOutlet errorPage={errorPage} />
    </ContainerContext.Provider>,
    document.getElementById('root')!,
  );
}

export interface BrowserRenderOptions {
  errorPage?: ComponentType<{ error: Error }>;
}
