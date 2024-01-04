import { type FunctionComponent } from 'preact';

import { HeadManager } from '../classes/head-manager.class';
import { useInjection } from '../hooks/use-injection.hook';

export const Head: FunctionComponent = ({ children }) => {
  const headManager = useInjection(HeadManager);

  if (!Array.isArray(children)) {
    children = [children];
  }

  for (const c of children as JSX.Element[]) {
    headManager.add(c);
  }

  return null;
};
