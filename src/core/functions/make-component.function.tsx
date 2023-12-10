import { configure } from 'mobx';
import { observer } from 'mobx-react';
import {
  type ComponentType,
  Component as PreactComponent,
  type ComponentClass as PreactComponentClass,
  type RenderableProps,
} from 'preact';
import { useContext } from 'preact/hooks';

import { COMPONENT_MKEY, COMPONENT_PROP_MKEY, COMPONENT_STATE_MKEY } from '../constants';
import { ComponentContext, type ComponentContextValue } from '../contexts/component.context';
import { ContainerContext } from '../contexts/container.context';
import {
  type ComponentClass,
  type ComponentInstance,
  type ComponentOptions,
  type ValueChanges,
} from '../types';

configure({ enforceActions: 'never' });

export function makeComponent<
  C extends ComponentClass = ComponentClass,
  P extends RenderableProps<{ [key: string]: any }> = InstanceType<C>,
  S = any,
>(constructor: C): ComponentType<P> {
  const options = Reflect.getMetadata<ComponentOptions>(COMPONENT_MKEY, constructor);

  if (!options) {
    throw new Error('Component not found');
  }

  const propKeys = Reflect.getMetadata<string[]>(COMPONENT_PROP_MKEY, constructor) || [];
  const stateKeys = Reflect.getMetadata<string[]>(COMPONENT_STATE_MKEY, constructor) || [];
  const { withFns = [] } = options;

  const Component = class extends PreactComponent<P, S> {
    static contextType = ComponentContext;
    static displayName = constructor.name;

    private readonly _component: InstanceType<C> & ComponentInstance;
    private _state: S;
    private readonly _mobxShouldComponentUpdate: (
      nextProps: P,
      nextState: S,
      nextContext: any,
    ) => boolean;

    state: S;

    constructor(props: P, context: any) {
      super(props, context);

      const { container } = this.context as ComponentContextValue;

      if (!container) {
        throw new Error('Container not found');
      }

      this._component = container.resolve<InstanceType<C> & ComponentInstance>(constructor as any);

      this.state = Object.fromEntries(
        stateKeys.map((stateKey) => [stateKey, this._component[stateKey]]),
      ) as S;

      this._state = { ...this.state };

      Object.defineProperties(
        this._component,
        Object.fromEntries(
          propKeys.map((propKey) => [
            propKey,
            {
              get: () => this.props[propKey] as unknown,
            },
          ]),
        ),
      );

      Object.defineProperties(
        this._component,
        Object.fromEntries(
          stateKeys.map((stateKey) => [
            stateKey,
            {
              get: () => this._state[stateKey] as unknown,
              set: (v) => {
                this._state[stateKey] = v;

                this.setState({ ...this._state });
              },
            },
          ]),
        ),
      );

      // eslint-disable-next-line @typescript-eslint/unbound-method
      this._mobxShouldComponentUpdate = this.shouldComponentUpdate!;
      this.shouldComponentUpdate = this._shouldComponentUpdate;
    }

    componentWillMount(): void {
      if (global.window) {
        this._component.onInit?.();
      }
    }

    componentDidMount(): void {
      this._component.afterViewInit?.();
    }

    _shouldComponentUpdate = (nextProps: P, nextState: S, nextContext: any): boolean => {
      let value = this._mobxShouldComponentUpdate(nextProps, nextState, nextContext);

      if (!this._component.onChanges) {
        return value;
      }

      try {
        const changes = {} as ValueChanges<P & S>;

        for (const k of propKeys) {
          const prev = this.props[k];
          const next = nextProps[k];

          if (prev === next) {
            continue;
          }

          changes[k as keyof P] = { prev, next };
        }

        for (const k of stateKeys) {
          const prev = this.state[k];
          const next = nextState[k];

          if (prev === next) {
            continue;
          }

          changes[k as keyof P] = { prev, next };
        }

        this._component.onChanges(changes as any);
      } catch (err) {
        console.error(err);
        value = false;
      }

      return value;
    };

    componentDidUpdate(): void {
      this._state = { ...this.state };
    }

    componentWillUnmount(): void {
      this._component.onDestroy?.();
    }

    render(): JSX.Element {
      return this._component.render();
    }
  } as PreactComponentClass<P, any>;

  if (options.observe) {
    observer(Component);
  }

  const WithFnsComponent = withFns.reduce((p, n) => n(p), Component as ComponentType<P>);

  const FnComponent = (props: P): JSX.Element => {
    const container = useContext(ContainerContext);

    return (
      <ComponentContext.Provider value={{ container }}>
        <WithFnsComponent {...props} />
      </ComponentContext.Provider>
    );
  };

  FnComponent.displayName = Component.displayName;

  return FnComponent;
}
