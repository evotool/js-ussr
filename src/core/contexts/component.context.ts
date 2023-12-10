import { type Container } from 'inversify';
import { createContext } from 'preact';

export const ComponentContext = createContext<ComponentContextValue>(null as any);

export interface ComponentContextValue {
  container: Container;
}
