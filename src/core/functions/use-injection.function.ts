import { useContext } from 'preact/hooks';

import { ContainerContext } from '../contexts/container.context';
import { type Type } from '../types';

export function useInjection<T>(token: symbol | string): T;
export function useInjection<T>(constructor: Type<T>): T;
export function useInjection<T>(token: Type<T> | symbol | string): T {
  const container = useContext(ContainerContext);
  const service = container.get<T>(token as any);

  return service;
}
