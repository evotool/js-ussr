import { enableStaticRendering } from 'mobx-react';

export * from './classes/head-manager.class';
export * from './classes/http-exception.class';
export * from './classes/route-data.class';
export * from './classes/route-snapshot.class';
export * from './classes/router-state-storage.class';
export * from './classes/router.class';

export * from './components/error-page.component';
export * from './components/head.component';
export * from './components/link.component';
export * from './components/router-outlet.component';

export * from './constants';

export * from './contexts/container.context';

export * from './decorators/inject.decorator';
export * from './decorators/injectable.decorator';
export * from './decorators/optional.decorator';

export * from './functions/apply-decorators.function';
export * from './functions/bind-providers.function';
export * from './functions/create-container.function';
export * from './functions/reflector.namespace';
export * from './functions/url-utils.namespace';

export * from './hooks/use-injection.hook';
export * from './hooks/use-router.hook';

export * from './types';

enableStaticRendering(!global.window);
