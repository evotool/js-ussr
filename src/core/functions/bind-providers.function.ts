import { type BindInWhenOnFluentSyntax, type Container } from 'inversify';

import { InjectableScope } from '../constants';
import { type Provider } from '../types';

export function bindProviders(container: Container, providers: Provider[]): void {
  for (const provider of providers) {
    const binding = container.bind(provider.provide);

    let bindingIn: BindInWhenOnFluentSyntax<any> | undefined;

    if ('useClass' in provider) {
      bindingIn = binding.to(provider.useClass);
    } else if ('useFactory' in provider) {
      bindingIn = binding.toDynamicValue(
        (context) => provider.useFactory(...provider.inject.map((t) => context.get(t))) as unknown,
      );
    } else {
      binding.toConstantValue(provider.useValue);
    }

    if ('scope' in provider && bindingIn) {
      if (provider.scope === InjectableScope.TRANSIENT) {
        bindingIn.inTransientScope();
      } else if (provider.scope === InjectableScope.REQUEST) {
        bindingIn.inRequestScope();
      } else {
        bindingIn.inSingletonScope();
      }
    } else if (bindingIn) {
      bindingIn.inSingletonScope();
    }
  }
}
