import { type FunctionComponent, type VNode } from 'preact';

import { HeadManager } from '../classes/head-manager.class';
import { useInjection } from '../hooks/use-injection.hook';

export const Head: FunctionComponent = (props) => {
  let { children } = props;

  const headManager = useInjection(HeadManager);

  if (!Array.isArray(children)) {
    children = [children];
  }

  for (const c of children as VNode<any>[]) {
    headManager.add(c);
  }

  return null;
};
