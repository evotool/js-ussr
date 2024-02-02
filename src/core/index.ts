import { enableStaticRendering } from 'mobx-react';
import { type FunctionComponent } from 'preact';
import { type JSXInternal } from 'preact/src/jsx';

import { type ValueChanges } from './types';

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

export * from './contexts/component.context';
export * from './contexts/container.context';

export * from './decorators/component.decorator';
export * from './decorators/inject.decorator';
export * from './decorators/injectable.decorator';
export * from './decorators/optional.decorator';
export * from './decorators/prop.decorator';
export * from './decorators/state.decorator';

export * from './functions/apply-decorators.function';
export * from './functions/bind-providers.function';
export * from './functions/create-container.function';
export * from './functions/create-element.function';
export * from './functions/get-inheritance-chain.function';
export * from './functions/make-component.function';
export * from './functions/reflector.namespace';
export * from './functions/resolve-route-chain.function';
export * from './functions/url-utils.namespace';

export * from './hooks/use-injection.hook';
export * from './hooks/use-router.hook';

export * from './types';

enableStaticRendering(!global.window);

declare global {
  namespace JSX {
    interface ClassComponent {
      onInit?(): void;
      afterViewInit?(): void;
      onChanges?(values: ValueChanges<{ [key: string]: any }>): void;
      onDestroy?(): void;
      render(): Element;
    }

    interface ElementAttributesProperty {}

    type LibraryManagedAttributes<
      Constructor,
      Instance extends { [key: string]: any },
    > = Constructor extends FunctionComponent<Instance>
      ? JSXInternal.LibraryManagedAttributes<Constructor, Instance>
      : Constructor extends { __preactClass: undefined }
        ? JSXInternal.LibraryManagedAttributes<
          Constructor,
          Instance['props'] & { [key: string]: any }
        >
        : Instance extends ClassComponent
          ? Omit<Instance, keyof ClassComponent>
          : Instance;

    type IntrinsicAttributes = JSXInternal.IntrinsicAttributes & { children?: any };
    type IntrinsicElements = JSXInternal.IntrinsicElements;

    type Element = JSXInternal.Element;
    type ElementClass = ClassComponent | JSXInternal.ElementClass;
    type ElementChildrenAttribute = JSXInternal.ElementChildrenAttribute;

    type DOMCSSProperties = JSXInternal.DOMCSSProperties;
    type AllCSSProperties = JSXInternal.AllCSSProperties;
    type CSSProperties = JSXInternal.CSSProperties;

    type DOMAttributes<Target extends EventTarget> = JSXInternal.DOMAttributes<Target>;
    type HTMLAttributes = JSXInternal.HTMLAttributes;
    type SVGAttributes = JSXInternal.SVGAttributes;
    type PathAttributes = JSXInternal.PathAttributes;

    type HTMLMarqueeElement = JSXInternal.HTMLMarqueeElement;

    type TargetedEvent = JSXInternal.TargetedEvent;
    type TargetedAnimationEvent<Target extends EventTarget> =
      JSXInternal.TargetedAnimationEvent<Target>;
    type TargetedClipboardEvent<Target extends EventTarget> =
      JSXInternal.TargetedClipboardEvent<Target>;
    type TargetedCompositionEvent<Target extends EventTarget> =
      JSXInternal.TargetedCompositionEvent<Target>;
    type TargetedDragEvent<Target extends EventTarget> = JSXInternal.TargetedDragEvent<Target>;
    type TargetedFocusEvent<Target extends EventTarget> = JSXInternal.TargetedFocusEvent<Target>;
    type TargetedKeyboardEvent<Target extends EventTarget> =
      JSXInternal.TargetedKeyboardEvent<Target>;
    type TargetedMouseEvent<Target extends EventTarget> = JSXInternal.TargetedMouseEvent<Target>;
    type TargetedPointerEvent<Target extends EventTarget> =
      JSXInternal.TargetedPointerEvent<Target>;
    type TargetedTouchEvent<Target extends EventTarget> = JSXInternal.TargetedTouchEvent<Target>;
    type TargetedTransitionEvent<Target extends EventTarget> =
      JSXInternal.TargetedTransitionEvent<Target>;
    type TargetedUIEvent<Target extends EventTarget> = JSXInternal.TargetedUIEvent<Target>;
    type TargetedWheelEvent<Target extends EventTarget> = JSXInternal.TargetedWheelEvent<Target>;

    type EventHandler<E extends TargetedEvent> = JSXInternal.EventHandler<E>;
    type AnimationEventHandler<Target extends EventTarget> =
      JSXInternal.AnimationEventHandler<Target>;
    type ClipboardEventHandler<Target extends EventTarget> =
      JSXInternal.ClipboardEventHandler<Target>;
    type CompositionEventHandler<Target extends EventTarget> =
      JSXInternal.CompositionEventHandler<Target>;
    type DragEventHandler<Target extends EventTarget> = JSXInternal.DragEventHandler<Target>;
    type FocusEventHandler<Target extends EventTarget> = JSXInternal.FocusEventHandler<Target>;
    type GenericEventHandler<Target extends EventTarget> = JSXInternal.GenericEventHandler<Target>;
    type InputEventHandler<Target extends EventTarget> = JSXInternal.InputEventHandler<Target>;
    type KeyboardEventHandler<Target extends EventTarget> =
      JSXInternal.KeyboardEventHandler<Target>;
    type MouseEventHandler<Target extends EventTarget> = JSXInternal.MouseEventHandler<Target>;
    type PointerEventHandler<Target extends EventTarget> = JSXInternal.PointerEventHandler<Target>;
    type SubmitEventHandler<Target extends EventTarget> = JSXInternal.SubmitEventHandler<Target>;
    type TouchEventHandler<Target extends EventTarget> = JSXInternal.TouchEventHandler<Target>;
    type TransitionEventHandler<Target extends EventTarget> =
      JSXInternal.TransitionEventHandler<Target>;
    type UIEventHandler<Target extends EventTarget> = JSXInternal.UIEventHandler<Target>;
    type WheelEventHandler<Target extends EventTarget> = JSXInternal.WheelEventHandler<Target>;
    type PictureInPictureEventHandler<Target extends EventTarget> =
      JSXInternal.PictureInPictureEventHandler<Target>;
  }
}
