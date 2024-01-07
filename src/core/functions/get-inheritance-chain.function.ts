import isFunction from 'lodash/isFunction';

import { type Type } from '../types';

const END_CONSTRUCTOR = Object.getPrototypeOf(Function);

export function getInheritanceChain(
  o: object | Function | Type,
  stopConstructor?: Function | Type,
): Type[] {
  const isConstructor = isFunction(o);
  let prototype: object | null = null;

  if (!isConstructor) {
    prototype = o === o.constructor.prototype ? o : Object.getPrototypeOf(o);
  }

  const constructors = [isConstructor ? o : prototype!.constructor] as Type[];

  for (const c of constructors) {
    const pc = Object.getPrototypeOf(c);

    if (pc === END_CONSTRUCTOR || pc === stopConstructor) {
      if (pc === stopConstructor) {
        constructors.push(stopConstructor as Type);
      }

      return constructors;
    }

    constructors.push(pc);
  }

  return constructors;
}
