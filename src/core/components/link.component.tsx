import { observer } from 'mobx-react';
import { type FunctionComponent } from 'preact';
import { useCallback } from 'preact/hooks';
import { type JSXInternal } from 'preact/src/jsx';

import { UrlUtils } from '../functions/url-utils.namespace';
import { useRouter } from '../hooks/use-router.hook';
import { type QueryParams } from '../types';

export const Link: FunctionComponent<LinkProps> = observer(
  ({ children, href, queryParams, target, onClick, activeClassName, ...props }) => {
    if (queryParams && Object.keys(queryParams).length) {
      href += `?${UrlUtils.buildQuery(queryParams)}`;
    }

    const router = useRouter();

    if (router.snapshot.url === href && activeClassName) {
      props.className = activeClassName;
    }

    const onAnchorClick = useCallback(
      (event: JSXInternal.TargetedMouseEvent<HTMLAnchorElement>) => {
        if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey || event.button) {
          return;
        }

        if (!href || !(/^\//).exec(href) || (target && !(/^_?self$/i).exec(target))) {
          return false;
        }

        (async () => {
          await onClick?.(event);
          await router.navigate(href);
        })().catch(console.error);

        event.stopImmediatePropagation?.();
        event.stopPropagation?.();
        event.preventDefault();

        return false;
      },
      [href, target, onClick, router],
    );

    return (
      <a href={href} target={target} onClick={onClick || (onAnchorClick as any)} {...props}>
        {children}
      </a>
    );
  },
);

export interface LinkProps extends Omit<JSX.HTMLAttributes, 'onClick'> {
  href: string;
  queryParams?: QueryParams;
  target?: string;
  activeClassName?: string;
  onClick?: (event: JSXInternal.TargetedMouseEvent<HTMLAnchorElement>) => void | Promise<void>;
}
