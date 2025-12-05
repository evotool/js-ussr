import { type AnyDecorator } from '../types';

export function applyDecorators(...decorators: AnyDecorator[]): AnyDecorator {
  return (target, propertyKey) => {
    for (const d of decorators) {
      d(target, propertyKey);
    }
  };
}
