import { type Container } from 'inversify';
import { type ComponentType, render } from 'preact';

import { RouterOutlet } from '../components/router-outlet.component';
import { ContainerContext } from '../contexts/container.context';

export function renderForBrowser(container: Container, options: BrowserRenderOptions = {}): void {
  const { errorPage } = options;

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
