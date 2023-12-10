import { EventEmitter } from 'eventemitter3';
import { type BrowserHistory, createBrowserHistory } from 'history';
import { Container } from 'inversify';
import { action, observable } from 'mobx';

import { RouteData } from './route-data.class';
import { RouteSnapshot } from './route-snapshot.class';
import { RouterStateStorage } from './router-state-storage.class';
import { InjectableScope, REQUEST, RESPONSE, ROUTES, RouterEventTypes } from '../constants';
import { Inject } from '../decorators/inject.decorator';
import { Injectable } from '../decorators/injectable.decorator';
import { Optional } from '../decorators/optional.decorator';
import { UrlUtils } from '../functions/url-utils.namespace';
import { type QueryParams, type Route, type RouterEventPayload } from '../types';

type IncomingMessage = import('http').IncomingMessage;
type ServerResponse = import('http').ServerResponse;

@Injectable({ scope: InjectableScope.DEFAULT })
export class Router {
  @observable
  private _snapshot: RouteSnapshot;

  private readonly _isBrowser: boolean;
  private readonly _history: BrowserHistory | undefined;
  private readonly _stateStorage = new RouterStateStorage();

  readonly events = new EventEmitter();

  get snapshot(): RouteSnapshot {
    return this._snapshot;
  }

  constructor(
    private readonly _container: Container,
    @Inject(ROUTES) private readonly _routes: Route[],
    @Inject(REQUEST) @Optional() private readonly _req?: IncomingMessage,
    @Inject(RESPONSE) @Optional() private readonly _res?: ServerResponse,
  ) {
    this._isBrowser = !!global.window;

    const url = this._isBrowser ? this._getLocationUrl(location) : this._req!.url!;

    this._snapshot = RouteSnapshot.fromUrl(url, this._routes);

    if (!this._isBrowser) {
      return;
    }

    // @ts-ignore
    const hydratedData = window.__HYDRATED || [];
    this._setDataForBrowser(hydratedData);

    this._history = createBrowserHistory();
    this._history.listen(({ location, action }) => {
      const url = this._getLocationUrl(location);

      const snapshot = this._stateStorage.get(url);

      if (!snapshot) {
        window.location.assign(url);

        return;
      }

      this._snapshot = snapshot;
      this._dispatchEvent(RouterEventTypes.NAVIGATION_END, snapshot);
    });

    addEventListener('routechange', (event) => this.events.emit('event', event));
  }

  async navigate(url: string, queryParams: QueryParams = {}): Promise<void> {
    if (Object.keys(queryParams).length) {
      url += `?${UrlUtils.buildQuery(queryParams)}`;
    }

    if (!this._isBrowser) {
      this._res?.writeHead(301, { Location: url }).end();

      return;
    }

    const snapshot = RouteSnapshot.fromUrl(url, this._routes);

    this._dispatchEvent(RouterEventTypes.NAVIGATION_START, snapshot);
    this._dispatchEvent(RouterEventTypes.RESOLVE_START, snapshot);

    await snapshot.resolveData(this._container);
    this._dispatchEvent(RouterEventTypes.RESOLVE_END, snapshot);

    this._stateStorage.add(url, snapshot);

    this._history!.push(url);
  }

  @action
  async resolveDataForServer(): Promise<void> {
    await this._snapshot.resolveData(this._container);
  }

  @action
  private _setDataForBrowser(data: RouteData[]): void {
    this._snapshot.data.length = 0;
    this._snapshot.data.push(...data.map((d) => new RouteData(d)));
  }

  private _dispatchEvent(type: RouterEventTypes, snapshot: RouteSnapshot): void {
    dispatchEvent(
      new CustomEvent<RouterEventPayload>('routechange', { detail: { type, snapshot } }),
    );
  }

  private _getLocationUrl(location: { pathname: string; search: string; hash: string }): string {
    const { pathname, search, hash } = location;

    return pathname + search + hash;
  }
}

// export interface RouteData {
//   url: string;
//   path: string;
//   query: string;
//   routeChain: Route[];
// }
