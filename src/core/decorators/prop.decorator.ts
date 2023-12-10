import isString from 'lodash/isString';

import { COMPONENT_PROP_MKEY } from '../constants';
import { Reflector } from '../functions/reflector.namespace';

export function Prop(): PropertyDecorator {
  return (target, propertyKey) => {
    if (!isString(propertyKey)) {
      throw new Error('Property key must be a string');
    }

    const { constructor } = target;

    Reflector.add(COMPONENT_PROP_MKEY, propertyKey)(constructor);
  };
}
