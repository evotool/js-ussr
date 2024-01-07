import { type PropertyKey } from '@abraham/reflection';
import { type Container } from 'inversify';
import {
  type ComponentClass as PreactComponentClass,
  type ComponentType as PreactComponentType,
  type VNode,
} from 'preact';

import { type RouteSnapshot } from './classes/route-snapshot.class';
import { type InjectableScope, type RouterEventTypes } from './constants';

export type Type<T = any, S = {}> = (new (...args: any[]) => T) & S;

export type Decorator = (target: any, propertyKey?: PropertyKey) => void;

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

export interface ComponentOptions {
  withFns?: WithFn[];
  observe?: boolean;
}

export type ValueChanges<O> = {
  [K in keyof O]?: { prev: O[K]; next: O[K] };
};

export interface ComponentInstance {
  onInit?(): void;
  afterViewInit?(): void;
  onChanges?(values: ValueChanges<this>): void;
  onDestroy?(): void;
  render(): JSX.Element;
}

export interface OnInit {
  onInit(): void;
}

export interface AfterViewInit {
  afterViewInit(): void;
}

export interface OnChanges {
  onChanges(values: ValueChanges<this>): void;
}

export interface OnDestroy {
  onDestroy(): void;
}

export type ComponentClass<P extends ComponentInstance = ComponentInstance> = Type<
  P,
  { Component?: PreactComponentClass<P>; [k: PropertyKey]: any }
>;

export type ComponentType<P = {}> = ComponentClass<P & ComponentInstance> | PreactComponentType<P>;

export type Props<P extends ComponentInstance = ComponentInstance> = Omit<
  P,
  keyof ComponentInstance
>;

export type WithFn = <P = any>(componentClass: PreactComponentType<P>) => PreactComponentType<P>;

export interface Params {
  [key: string]: string;
}

export interface QueryParams {
  [key: string]: string | string[];
}

export interface Styles {
  [className: string]: string;
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

export type EvoNode<P = {}> = VNode<P>;
