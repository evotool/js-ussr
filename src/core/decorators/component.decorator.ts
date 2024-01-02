import { injectable } from 'inversify';
import { type ComponentClass as PreactComponentClass } from 'preact';

import { COMPONENT_MKEY } from '../constants';
import { applyDecorators } from '../functions/apply-decorators.function';
import { makeComponent } from '../functions/make-component.function';
import { Reflector } from '../functions/reflector.namespace';
import { type ComponentOptions } from '../types';

export function Component(options: ComponentOptions = {}): ClassDecorator {
  return applyDecorators(Reflector.set(COMPONENT_MKEY, options), injectable(), (target) => {
    Object.defineProperty(target, 'Component', {
      get() {
        this._Component ||= makeComponent(target);

        return this._Component as PreactComponentClass;
      },
    });
  });
}
