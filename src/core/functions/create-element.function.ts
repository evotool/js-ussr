import { type Attributes, type ComponentChild, Fragment as _Fragment, h as preactH } from 'preact';

import { type ComponentClass, type ComponentType, type EvoNode } from '../types';

export type HStringProps = JSX.HTMLAttributes & JSX.SVGAttributes & Record<string, any>;
export type HTypeProps<P> = Attributes & P;

type Child = ComponentChild | ComponentChild[];

export function createElement(
  type: string,
  props: HStringProps | null,
  ...children: Child[]
): EvoNode<any>;
export function createElement<P>(
  type: ComponentType<P>,
  props: HTypeProps<P> | null,
  ...children: Child[]
): EvoNode<P>;
export function createElement<P>(
  type: string | ComponentType<P>,
  props: HStringProps | null,
  ...children: Child[]
): EvoNode<P> {
  type = (type as unknown as ComponentClass<any>).Component || type;

  return preactH(type as any, props, ...children) as EvoNode<P>;
}

export const h = createElement;
export const Fragment = _Fragment;
