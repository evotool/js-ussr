import { type RouteSnapshot } from './route-snapshot.class';

export class RouterStateStorage {
  private readonly _states: { [key: string]: RouteSnapshot } = {};
  private _stateCount = 0;
  private readonly _maxStateCount = global.window ? history.length : 1;

  get(key: string): RouteSnapshot | undefined {
    return this._states[key];
  }

  add(key: string, snapshot: RouteSnapshot): void {
    this._states[key] = snapshot;
    this._stateCount++;

    if (this._stateCount > this._maxStateCount) {
      for (const key in this._states) {
        if (Object.hasOwn(this._states, key)) {
          delete this._states[key];

          break;
        }
      }
    }
  }
}
