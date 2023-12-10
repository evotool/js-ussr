export const COMPONENT_MKEY = 'component';
export const COMPONENT_PROP_MKEY = 'component:prop';
export const COMPONENT_STATE_MKEY = 'component:state';

export const INJECTABLE_MKEY = 'injectable';

export const REQUEST = 'request';
export const RESPONSE = 'response';
export const ROUTES = 'routes';

export enum InjectableScope {
  DEFAULT = 0,
  TRANSIENT = 2,
  REQUEST = 3,
}

export enum RouterEventTypes {
  NAVIGATION_START = 'navigation_start',
  NAVIGATION_END = 'navigation_end',
  RESOLVE_START = 'resolve_start',
  RESOLVE_END = 'resolve_end',
}
