import { type IncomingMessage, type ServerResponse } from 'http';
import { Container } from 'inversify';
import isFunction from 'lodash/isFunction';

import { bindProviders } from './bind-providers.function';
import { Reflector } from './reflector.namespace';
import { HeadManager } from '../classes/head-manager.class';
import { Router } from '../classes/router.class';
import { INJECTABLE_MKEY, REQUEST, RESPONSE, ROUTES } from '../constants';
import { type ClassProvider, type Provider, type Route, type Type } from '../types';

export function createContainer(
  routes: Route[],
  providers: (Provider | Type)[] = [],
  serverOptions?: ServerOptions,
): Container {
  const container = new Container();
  const globalProviders: (Provider | Type)[] = [];

  globalProviders.push(
    HeadManager,
    Router,
    { provide: Container, useValue: container },
    { provide: ROUTES, useValue: routes },
    { provide: REQUEST, useValue: serverOptions?.req },
    { provide: RESPONSE, useValue: serverOptions?.res },
  );

  if (!global.window) {
    globalProviders.push({ provide: 'destroy_collection', useFactory: () => [], inject: [] });
  }

  const allProviders: Provider[] = providers
    .concat(globalProviders)
    .map((x) =>
      isFunction(x)
        ? Reflector.find<ClassProvider>(INJECTABLE_MKEY, x) ||
          ({ provide: x, useClass: x } as ClassProvider)
        : (x as Provider));

  bindProviders(container, allProviders);

  return container;
}

export interface ServerOptions {
  req: IncomingMessage;
  res: ServerResponse;
}
