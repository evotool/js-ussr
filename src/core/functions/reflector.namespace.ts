import { type PropertyKey, type Target } from '@abraham/reflection';

import { type Decorator } from '../types';

export namespace Reflector {
  export function find<T>(key: string, target: Target): T | undefined;
  export function find<T>(key: string, target: Target, propertyKey: PropertyKey): T | undefined;
  export function find<T>(key: string, target: Target, propertyKey?: PropertyKey): T | undefined {
    return Reflect.getOwnMetadata<T>(key, target, propertyKey);
  }

  export function get<T>(key: string, target: Target): T;
  export function get<T>(key: string, target: Target, propertyKey: PropertyKey): T;
  export function get<T>(key: string, target: Target, propertyKey?: PropertyKey): T {
    const metadata = find<T>(key, target, propertyKey!);

    if (!metadata) {
      throw new Error(`Metadata not found: ${key}`);
    }

    return metadata;
  }

  export function set<T>(key: string, value: T): Decorator {
    return Reflect.metadata(key, value);
  }

  export function add<T>(key: string, value: T): Decorator {
    return (target, propertyKey) => {
      const array = find<T[]>(key, target, propertyKey!);

      if (!array) {
        set(key, [value])(target, propertyKey);

        return;
      }

      array.push(value);
    };
  }
}
