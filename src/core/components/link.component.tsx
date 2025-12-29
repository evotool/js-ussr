import { observer } from 'mobx-react';
import { type AnchorHTMLAttributes, type FunctionComponent, type TargetedMouseEvent } from 'preact';
import { useCallback } from 'preact/hooks';

import { UrlUtils } from '../functions/url-utils.namespace';
import { useRouter } from '../hooks/use-router.hook';
import { type QueryParams } from '../types';

export const Link: FunctionComponent<LinkProps> = observer((allProps) => {
  let { children, href, queryParams, target, onClick, activeClassName, ...props } = allProps;

  if (queryParams && Object.keys(queryParams).length) {
    href += `?${UrlUtils.buildQuery(queryParams)}`;
  }

  const router = useRouter();

  if (router.snapshot.url === href && activeClassName) {
    props.className = activeClassName;
  }

  const onAnchorClick = useCallback(
    (event: TargetedMouseEvent<HTMLAnchorElement>) => {
      if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey || event.button) {
        return;
      }

      if (!href || !href.startsWith('/') || (target && !(/^_?self$/i).exec(target))) {
        return false;
      }

      (async () => {
        const preventNavigate = await onClick?.(event);

        if (preventNavigate) {
          return;
        }

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
    <a href={href} target={target} onClick={onAnchorClick} {...props}>
      {children}
    </a>
  );
});

export interface LinkProps extends Omit<AnchorHTMLAttributes, 'onClick'> {
  href: string;
  queryParams?: QueryParams;
  target?: string;
  activeClassName?: string;
  onClick?: (event: TargetedMouseEvent<HTMLAnchorElement>) => any | Promise<any>;
}
