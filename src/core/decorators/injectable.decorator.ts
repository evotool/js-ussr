import { injectable } from 'inversify';

import { INJECTABLE_MKEY } from '../constants';
import { applyDecorators } from '../functions/apply-decorators.function';
import { Reflector } from '../functions/reflector.namespace';
import { type ClassProvider, type InjectableOptions } from '../types';

export function Injectable(options: InjectableOptions = {}): ClassDecorator {
  const { scope } = options;

  return applyDecorators(
    (target) =>
      Reflector.set<ClassProvider>(INJECTABLE_MKEY, {
        provide: target,
        useClass: target,
        scope,
      })(target),
    injectable(),
  );
}
