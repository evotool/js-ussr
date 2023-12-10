type JSXInternal = import('preact/src/jsx').JSXInternal;

declare namespace JSX {
  declare interface ElementAttributesProperty {}

  declare interface ClassComponent {
    onInit?(): void;
    afterViewInit?(): void;
    onChanges?(values: import('./types').ValueChanges<this>): void;
    onDestroy?(): void;
    render(): Element;
  }

  declare type LibraryManagedAttributes<Constructor, Instance> =
    Constructor extends import('preact').FunctionComponent<Instance>
      ? JSXInternal.LibraryManagedAttributes<Constructor, Instance>
      : Constructor extends { __preactClass: undefined }
        ? JSXInternal.LibraryManagedAttributes<
          Constructor,
          Instance['props'] & { [key: string]: any }
        >
        : Instance extends ClassComponent
          ? Omit<Instance, keyof ClassComponent>
          : Instance;

  declare type IntrinsicAttributes = JSXInternal.IntrinsicAttributes & {
    children?: any;
  };
  declare type IntrinsicElements = JSXInternal.IntrinsicElements;

  declare type Element = JSXInternal.Element;
  declare type ElementClass = ClassComponent | JSXInternal.ElementClass;
  declare type ElementChildrenAttribute =
    JSXInternal.ElementChildrenAttribute;

  declare type DOMCSSProperties = JSXInternal.DOMCSSProperties;
  declare type AllCSSProperties = JSXInternal.AllCSSProperties;
  declare type CSSProperties = JSXInternal.CSSProperties;

  declare type DOMAttributes = JSXInternal.DOMAttributes;
  declare type HTMLAttributes = JSXInternal.HTMLAttributes;
  declare type SVGAttributes = JSXInternal.SVGAttributes;
  declare type PathAttributes = JSXInternal.PathAttributes;

  declare type HTMLMarqueeElement = JSXInternal.HTMLMarqueeElement;

  declare type TargetedEvent = JSXInternal.TargetedEvent;
  declare type TargetedAnimationEvent = JSXInternal.TargetedAnimationEvent;
  declare type TargetedClipboardEvent = JSXInternal.TargetedClipboardEvent;
  declare type TargetedCompositionEvent =
    JSXInternal.TargetedCompositionEvent;
  declare type TargetedDragEvent = JSXInternal.TargetedDragEvent;
  declare type TargetedFocusEvent = JSXInternal.TargetedFocusEvent;
  declare type TargetedKeyboardEvent = JSXInternal.TargetedKeyboardEvent;
  declare type TargetedMouseEvent = JSXInternal.TargetedMouseEvent;
  declare type TargetedPointerEvent = JSXInternal.TargetedPointerEvent;
  declare type TargetedTouchEvent = JSXInternal.TargetedTouchEvent;
  declare type TargetedTransitionEvent =
    JSXInternal.TargetedTransitionEvent;
  declare type TargetedUIEvent = JSXInternal.TargetedUIEvent;
  declare type TargetedWheelEvent = JSXInternal.TargetedWheelEvent;

  declare type EventHandler = JSXInternal.EventHandler;
  declare type AnimationEventHandler = JSXInternal.AnimationEventHandler;
  declare type ClipboardEventHandler = JSXInternal.ClipboardEventHandler;
  declare type CompositionEventHandler =
    JSXInternal.CompositionEventHandler;
  declare type DragEventHandler = JSXInternal.DragEventHandler;
  declare type FocusEventHandler = JSXInternal.FocusEventHandler;
  declare type GenericEventHandler = JSXInternal.GenericEventHandler;
  declare type KeyboardEventHandler = JSXInternal.KeyboardEventHandler;
  declare type MouseEventHandler = JSXInternal.MouseEventHandler;
  declare type PointerEventHandler = JSXInternal.PointerEventHandler;
  declare type TouchEventHandler = JSXInternal.TouchEventHandler;
  declare type TransitionEventHandler = JSXInternal.TransitionEventHandler;
  declare type UIEventHandler = JSXInternal.UIEventHandler;
  declare type WheelEventHandler = JSXInternal.WheelEventHandler;
}
