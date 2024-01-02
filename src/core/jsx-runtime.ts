import {
  type Attributes,
  type ComponentChild,
  type ComponentType as PreactComponentType,
  Fragment as _Fragment,
} from 'preact';
import { jsx as preactJsx } from 'preact/jsx-runtime';

import {
  type ComponentClass,
  type ComponentInstance,
  type ComponentType,
  type EvoNode,
} from './types';

type Child = ComponentChild | ComponentChild[];

type JsxStringProps = JSX.HTMLAttributes &
JSX.SVGAttributes &
Record<string, any> & { children?: Child };
type JsxTypeProps<P> = Attributes & P & { children?: Child };
type JsxProps<P> = JsxStringProps | JsxTypeProps<P>;

function createEvoNode<P>(
  type: string,
  props: JsxStringProps,
  key?: string,
  __self?: boolean,
  __source?: { fileName: string; lineNumber: number; columnNumber: number },
): EvoNode<P>;
function createEvoNode<P>(
  type: ComponentClass<P & ComponentInstance>,
  props: JsxTypeProps<P>,
  key?: string,
  __self?: boolean,
  __source?: { fileName: string; lineNumber: number; columnNumber: number },
): EvoNode<P>;
function createEvoNode<P>(
  type: PreactComponentType<P>,
  props: JsxTypeProps<P>,
  key?: string,
  __self?: boolean,
  __source?: { fileName: string; lineNumber: number; columnNumber: number },
): EvoNode<P>;

function createEvoNode<P>(
  type: string | ComponentType<P>,
  props: JsxProps<P>,
  key?: string,
  __self?: boolean,
  __source?: { fileName: string; lineNumber: number; columnNumber: number },
): EvoNode<P> {
  type JsxFn = (
    type: string | ComponentType<P>,
    props: JsxProps<P>,
    key?: string,
    __self?: boolean,
    __source?: { fileName: string; lineNumber: number; columnNumber: number },
  ) => EvoNode<P>;
  type = (type as unknown as ComponentClass<any>).Component || type;

  return (preactJsx as unknown as JsxFn)(type, props, key, __self, __source);
}

export const jsx = createEvoNode;
export const jsxs = createEvoNode;
export const jsxDEV = createEvoNode;
export const Fragment = _Fragment;
