import { type Container, type interfaces } from 'inversify';

import { InjectableScope } from '../constants';
import { type Provider } from '../types';

export function bindProviders(container: Container, providers: Provider[]): void {
  for (const p of providers) {
    const binding = container.bind(p.provide);

    let bindingIn: interfaces.BindingInWhenOnSyntax<any> | undefined;

    if ('useClass' in p) {
      bindingIn = binding.to(p.useClass);
    } else if ('useFactory' in p) {
      bindingIn = binding.toDynamicValue(
        ({ container }) => p.useFactory(...p.inject.map((t) => container.get(t))) as unknown,
      );
    } else {
      binding.toConstantValue(p.useValue);
    }

    if ('scope' in p && bindingIn) {
      if (p.scope === InjectableScope.TRANSIENT) {
        bindingIn.inTransientScope();
      } else if (p.scope === InjectableScope.REQUEST) {
        bindingIn.inRequestScope();
      } else {
        bindingIn.inSingletonScope();
      }
    } else if (bindingIn) {
      bindingIn.inSingletonScope();
    }
  }
}
