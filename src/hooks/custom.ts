import {
  Dispatch,
  EffectCallback,
  MutableRefObject,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";

/**
 * Interface of an object that contains a reference `current` to a type `T` that
 * cannot be reassigned.
 */
export interface ImmutableRefObject<T> {
  readonly current: T;
}

/**
 * @internal Hooks
 * Resolve the initial value of a state hook.
 */
export const resolveSet = <S>(x: S | (() => S)) =>
  typeof x === "function" ? (x as () => S)() : x;

/**
 * Given a ref and a dispatch function, product of a `useState` hook, it makes a wrapper
 * function that updates the reference and sets the stateful value.
 */
export function makeRefSetter<T>(
  xRef: MutableRefObject<T>,
  setX: Dispatch<SetStateAction<T>>
): Dispatch<T> {
  // TODO Resolve Dispatch constraint
  return (x) => {
    xRef.current = x;
    setX(x);
  };
}

/**
 * @param value The value to be returned on each render.
 * @returns The constant `value` passed during the first render.
 */
export const useConst = <S>(value: () => S): S => {
  const ref = useRef<S>();
  if (ref.current === undefined) {
    ref.current = value();
  }
  return ref.current;
};

// TODO Use Option instead?
/**
 * @param value The value to be accessed on the next render.
 * @returns The `value` that the parameter had on a previous render.
 */
export function usePrevious<A>(value: A) {
  const ref = useRef<A>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

/**
 * A mix of hooks `useState` and `useRef`, it returns a returns a 3-tuple made of a
 * mutable ref (initialized by the `def` parameter), a function to update the ref as well as
 * trigger the re-render, and the stateful value that tags along with it.
 * @returns An object that will persist for the full lifetime of the component.
 */
export function useStateRef<T>(
  def: T
): [ImmutableRefObject<T>, Dispatch<T>, T] {
  const ref = useRef(def);
  const [x, setX] = useState(def);
  return [ref, makeRefSetter(ref, setX), x];
}

/**
 * Accepts a function that contains imperative, possibly effectful code.
 * Unlike `useEffect`, the `effect` function will not run on the first `skip` number of occassions.
 * Even, when its `deps` have changed.
 * @param effect Imperative function that can return a cleanup function
 * @param deps If present, effect will only activate if the values in the list change.
 * @param skip Number of iterations to skip.
 */
export function useEffectSkipping(
  effect: EffectCallback,
  deps?: ReadonlyArray<unknown>,
  skip: number = 1
) {
  const ref = useRef(0);
  useEffect(() => {
    if (ref.current < skip) {
      ref.current += 1;
    } else {
      return effect();
    }
  }, deps);
}

/**
 * `useCounter` returns a stateful number, a function to `increment` it (one unit by default)
 * and another to `decrement` it (one unit by default).
 * @param initial Can be passed as the beginning value of the counter.
 * @returns A tuple pair containing the current count as well as a function to increment it.
 */
export function useCounter(
  // <T: Enum> TODO See if this can be generalized to Enums
  initial: number = 0
): [number, (i?: number) => void, (d?: number) => void] {
  const [c, setCount] = useState(initial);
  const increment = (i: number = 1) => setCount(c + i);
  const decrement = (d: number = 1) => setCount(c - d);
  return [c, increment, decrement];
}

// export const useCountdown = (initial: number) => {
//   const [c, _, decrement] = useCounter(initial);
//   return [c, decrement];
// }

/**
 * `useTrigger` returns a stateful trigger boolean, and then a function to `activate`
 * it by flipping it's current value.
 */
export function useTrigger(): [boolean, () => void] {
  const [t, setT] = useStateRef(false);
  return [t.current, () => setT(!t.current)];
}

/**
 * Hook that emulates behaviour of lifecycle method `componentDidMount`, available in Class Components.
 * Accepts a function that contains imperative, possibly effectful code.
 * Unlike `useEffect`, the `effect` function will run only once, after the first render has happened.
 * @param effect Imperative function that can return a cleanup function.
 */
export const useDidMountEffect = (effect: EffectCallback) =>
  useEffect(effect, []);

/**
 * Hook that emulates behaviour of lifecycle method `componentDidUpdate`, available in Class Components.
 * Accepts a function that contains imperative, possibly effectful code.
 * Unlike `useEffect`, the `effect` function will not be run after the first render.
 * Any subsequent renders or any changes to the `deps` will trigger the `effect`.
 * @param effect Imperative function that can return a cleanup function.
 * @param deps If present, effect will only activate if the values in the list change.
 */
export const useDidUpdateEffect = (
  effect: EffectCallback,
  deps?: ReadonlyArray<unknown>
) => useEffectSkipping(effect, deps);

// TODO REVIEW
/**
 * Hook that emulates behaviour of lifecycle method `componentWillUnmount`, available in Class Components.
 * Accepts a function that contains imperative, possibly effectful code.
 * Unlike `useEffect`, the `effect` function will only be run as the component is being unmounted.
 * @param effect Imperative function.
 */
export const useWillUnmountEffect = (effect: () => void) =>
  useEffect(() => effect, []);
