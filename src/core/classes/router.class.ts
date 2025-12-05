import { EventEmitter } from 'eventemitter3';
import { type BrowserHistory, createBrowserHistory } from 'history';
import { Container } from 'inversify';
import { makeObservable, observable } from 'mobx';

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
  readonly snapshot!: RouteSnapshot;

  private readonly _isBrowser: boolean;
  private readonly _history: BrowserHistory | undefined;
  private readonly _stateStorage = new RouterStateStorage();

  readonly events = new EventEmitter();

  constructor(
    private readonly _container: Container,
    @Inject(ROUTES) private readonly _routes: Route[],
    @Inject(REQUEST) @Optional() private readonly _req?: IncomingMessage,
    @Inject(RESPONSE) @Optional() private readonly _res?: ServerResponse,
  ) {
    this._isBrowser = !!global.window;

    const uri = this._isBrowser ? this._getLocationUri(location) : this._req!.url!;

    this._setSnapshot(RouteSnapshot.fromUri(uri, this._routes));

    makeObservable(this, {
      snapshot: observable,
    });

    if (!this._isBrowser) {
      return;
    }

    // @ts-ignore
    const serverData = window.$_DATA || [];
    this._setDataForBrowser(serverData);

    this._history = createBrowserHistory();
    this._history.listen(({ location }) => {
      const uri = this._getLocationUri(location);
      const snapshot = this._stateStorage.get(uri);

      if (!snapshot) {
        window.location.assign(uri);

        return;
      }

      this._setSnapshot(snapshot);
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

    const snapshot = RouteSnapshot.fromUri(url, this._routes);

    this._dispatchEvent(RouterEventTypes.NAVIGATION_START, snapshot);
    this._dispatchEvent(RouterEventTypes.RESOLVE_START, snapshot);

    await snapshot.resolveData(this._container);
    this._dispatchEvent(RouterEventTypes.RESOLVE_END, snapshot);

    this._stateStorage.add(url, snapshot);

    this._history!.push(url);
  }

  async resolveDataForServer(): Promise<void> {
    await this.snapshot.resolveData(this._container);
  }

  private _setDataForBrowser(data: RouteData[]): void {
    this.snapshot.data.length = 0;
    this.snapshot.data.push(...data.map((d) => new RouteData(d)));
  }

  private _setSnapshot(snapshot: RouteSnapshot): void {
    // @ts-ignore
    this.snapshot = snapshot;
  }

  private _dispatchEvent(type: RouterEventTypes, snapshot: RouteSnapshot): void {
    dispatchEvent(
      new CustomEvent<RouterEventPayload>('routechange', { detail: { type, snapshot } }),
    );
  }

  private _getLocationUri(location: { pathname: string; search: string; hash: string }): string {
    const { pathname, search, hash } = location;

    return pathname + search + hash;
  }
}
