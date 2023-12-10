import { type Decorator } from '../types';

export function applyDecorators(...decorators: Decorator[]): Decorator {
  return (target, propertyKey) => {
    for (const d of decorators) {
      d(target, propertyKey);
    }
  };
}
