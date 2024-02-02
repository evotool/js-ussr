import 'core-js/modules/web.immediate';

import { type IReactionDisposer, autorun, configure, isObservable, toJS } from 'mobx';
import { observer } from 'mobx-react';
import {
  type ComponentType,
  Component as PreactComponent,
  type ComponentClass as PreactComponentClass,
  type RenderableProps,
} from 'preact';
import { useContext } from 'preact/hooks';

import { getInheritanceChain } from './get-inheritance-chain.function';
import { Reflector } from './reflector.namespace';
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
  const options = Reflector.find<ComponentOptions>(COMPONENT_MKEY, constructor);

  if (!options) {
    throw new Error('Component not found');
  }

  const constructors = getInheritanceChain(constructor);

  const propKeys = constructors.flatMap(
    (c) => Reflector.find<string[]>(COMPONENT_PROP_MKEY, c) || [],
  );
  const stateKeys = constructors.flatMap(
    (c) => Reflector.find<string[]>(COMPONENT_STATE_MKEY, c) || [],
  );

  const { withFns = [], observe } = options;

  const Component = class extends PreactComponent<P, S> {
    static contextType = ComponentContext;
    static displayName = constructor.name;

    private readonly _component: InstanceType<C> & ComponentInstance;
    private _state: S;
    private readonly _parentShouldComponentUpdate?: (
      nextProps: P,
      nextState: S,
      nextContext: any,
    ) => boolean;

    private readonly _reactionDisposers: IReactionDisposer[] = [];

    state: S;

    constructor(props: P, context: any) {
      super(props, context);

      const { container } = this.context as ComponentContextValue;

      if (!container) {
        throw new Error('Container not found');
      }

      this.state = {} as S;
      this._state = {} as S;

      const propertyDescriptorMap: PropertyDescriptorMap = {
        ...Object.fromEntries(
          propKeys.map((propKey) => [
            propKey,
            {
              get: () => this.props[propKey] as unknown,
              configurable: true,
            },
          ]),
        ),
        ...Object.fromEntries(
          stateKeys.map((stateKey) => [
            stateKey,
            {
              get: () => this._state[stateKey] as unknown,
              set: (newValue) => {
                this._state[stateKey] = newValue;

                if (this._component) {
                  this.setState({ ...this._state });

                  return;
                }

                this.state[stateKey] = newValue;
              },
              configurable: true,
            },
          ]),
        ),
      };

      Object.defineProperties(constructor.prototype, propertyDescriptorMap);

      this._component = container.resolve<InstanceType<C> & ComponentInstance>(constructor as any);

      for (const stateKey of stateKeys) {
        const stateValue = this._component[stateKey];

        this.state[stateKey] = stateValue;
        this._state[stateKey] = stateValue;
      }

      Object.defineProperties(this._component, propertyDescriptorMap);

      if (this.shouldComponentUpdate) {
        // eslint-disable-next-line @typescript-eslint/unbound-method
        this._parentShouldComponentUpdate = this.shouldComponentUpdate!;
      }

      this.shouldComponentUpdate = this._shouldComponentUpdate;

      if (!global.window && this._component.onDestroy) {
        const collection = container.get<(() => void | Promise<void>)[]>('destroy_collection');
        collection.push(() => this._component.onDestroy!());
      }
    }

    componentWillMount(): void {
      this._component.onInit?.();

      if (!global.window || !observe || !this._component.onChanges) {
        return;
      }

      const component = this._component;

      for (const key in component) {
        if (!Object.hasOwn(component, key) || !isObservable(component[key])) {
          continue;
        }

        const store = component[key];

        let prevState = null;
        let immediateId: any;

        this._reactionDisposers.push(
          autorun(() => {
            for (const storeKey in store) {
              if (!Object.hasOwn(store, storeKey)) {
                continue;
              }

              void store[storeKey];
            }

            clearImmediate(immediateId);

            immediateId = setImmediate(() => {
              const nextState = toJS(store);

              if (prevState) {
                component.onChanges!({
                  [key]: {
                    prev: prevState,
                    next: nextState,
                  },
                });
              }

              prevState = nextState;
            });
          }),
        );
      }
    }

    componentDidMount(): void {
      this._component.afterViewInit?.();
    }

    _shouldComponentUpdate = (nextProps: P, nextState: S, nextContext: any): boolean => {
      if (this._component.onChanges) {
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
        }
      }

      return this._parentShouldComponentUpdate?.(nextProps, nextState, nextContext) ?? true;
    };

    componentDidUpdate(): void {
      this._state = { ...this.state };
    }

    componentWillUnmount(): void {
      this._component.onDestroy?.();

      if (observe && global.window) {
        for (const disposer of this._reactionDisposers) {
          disposer();
        }
      }
    }

    render(): JSX.Element {
      return this._component.render();
    }
  } as PreactComponentClass<P, any>;

  if (observe) {
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
