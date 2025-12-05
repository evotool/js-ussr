import { type PropertyKey } from '@abraham/reflection';
import { type Container } from 'inversify';
import { type ComponentType } from 'preact';

import { type RouteSnapshot } from './classes/route-snapshot.class';
import { type InjectableScope, type RouterEventTypes } from './constants';

export interface Type<T = any> {
  new (...args: any): T;
  [key: string | symbol]: any;
}

export type AnyDecorator = (target: any, propertyKey?: PropertyKey) => void;

export interface ClassProvider {
  provide: Type | string | symbol;
  useClass: Type;
  scope?: InjectableScope;
}

export interface FactoryProvider<A extends any[] = any[]> {
  provide: Type | string | symbol;
  useFactory(...args: A): any;
  inject: A;
  scope?: InjectableScope;
}

export interface ValueProvider<T = any> {
  provide: Type | string | symbol;
  useValue: T;
}

export type Provider = ClassProvider | ValueProvider | FactoryProvider;

export interface InjectableOptions {
  scope?: InjectableScope;
}

export interface Params {
  [key: string]: string;
}

export interface QueryParams {
  [key: string]: string | string[];
}

export interface Route {
  path: string;
  component?: ComponentType<any>;
  resolve?: ResolveFn<any>;
  children?: Route[];
  redirectTo?: string;
}

export type ResolveFn<P extends {} = {}> = (
  this: RouteSnapshot,
  container: Container,
) => P | Promise<P>;

export interface RouterEventPayload {
  type: RouterEventTypes;
  snapshot: RouteSnapshot;
}
