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

    private readonly _reactionDisposers: Record<string, IReactionDisposer> = {};
    private readonly _component: InstanceType<C> & ComponentInstance;
    private _state: S;

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

                if (global.window && isObservable(newValue)) {
                  this._registerObservable(stateKey);
                }
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

      if (!global.window && this._component.onDestroy) {
        const collection = container.get<(() => void | Promise<void>)[]>('destroy_collection');
        collection.push(() => this._component.onDestroy!());
      }

      if (global.window) {
        for (const propKey in props) {
          if (Object.hasOwn(props, propKey) && isObservable(props[propKey])) {
            this._registerObservable(propKey);
          }
        }
      }
    }

    componentWillMount(): void {
      this._component.onInit?.();

      if (!global.window || !observe || !this._component.onChanges) {
        return;
      }

      for (const key in this._component) {
        if (!Object.hasOwn(this._component, key) || !isObservable(this._component[key])) {
          continue;
        }

        this._registerObservable(key);
      }
    }

    private _registerObservable(key: string): void {
      let prevState = null;
      let immediateId: any;

      const store = this._component[key];

      this._reactionDisposers[key]?.();

      this._reactionDisposers[key] = autorun(() => {
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
            this._component.onChanges?.({
              [key]: {
                prev: prevState,
                next: nextState,
              },
            });
          }

          prevState = nextState;
        });
      });
    }

    componentDidMount(): void {
      this._component.afterViewInit?.();
    }

    getSnapshotBeforeUpdate(prevProps: P, prevState: S): void {
      const nextProps = this.props;
      const nextState = this.state;

      const changes = {} as ValueChanges<P & S>;

      for (const propKey of propKeys) {
        const prev = prevProps[propKey];
        const next = nextProps[propKey];

        if (prev === next) {
          continue;
        }

        if (isObservable(next)) {
          this._registerObservable(propKey);
        }

        if (this._component.onChanges) {
          changes[propKey as keyof P] = { prev, next };
        }
      }

      for (const stateKey of stateKeys) {
        const prev = prevState[stateKey];
        const next = nextState[stateKey];

        if (prev === next) {
          continue;
        }

        if (this._component.onChanges) {
          changes[stateKey as keyof S] = { prev, next };
        }
      }

      try {
        this._component.onChanges?.(changes);
      } catch (err) {
        console.error(err);
      }
    }

    componentDidUpdate(): void {
      this._state = { ...this.state };
    }

    componentWillUnmount(): void {
      this._component.onDestroy?.();

      if (observe && global.window) {
        this._dispose();
      }
    }

    private _dispose(): void {
      for (const dispose of Object.values(this._reactionDisposers)) {
        dispose();
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
