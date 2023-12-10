import { type Container } from 'inversify';
import { createContext } from 'preact';

export const ContainerContext = createContext<Container>(null as any);
