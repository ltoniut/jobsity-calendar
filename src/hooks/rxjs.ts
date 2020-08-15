import { useEffect, useState } from "react";
import { BehaviorSubject, Observable, Subscription } from "rxjs";
import { resolveSet, useConst } from "./custom";

/**
 * @param s Subscription to an Observable stream.
 * @returns A function to lazily handle unsubscriptions from Observables.
 */
export const lazyUnsubscribe = (s: Subscription) => () => s.unsubscribe();

// TODO Watch out for changes in ref.
/**
 * Create a new BehaviorSubject from an Observable and an `initialState`
 * @param o$ An rxjs `Observable` source for the `BehaviorSubject`.
 * @param initialState Initial value of the `BehaviorSubject`.
 * @returns Latest state value.
 */
export const useHoldObservable = <S>(
  o$: Observable<S>,
  initialState: S | (() => S)
) => {
  const b$ = useConst(() => new BehaviorSubject<S>(resolveSet(initialState)));
  useEffect(() => lazyUnsubscribe(o$.subscribe(b$)), [o$]);
  return b$;
};

/**
 * @param b$ A rxjs `BehaviorSubject` that sets a new state with whatever comes through the stream pipeline.
 * @returns Latest state value.
 */
export const useBehaviorState = <S>(b$: BehaviorSubject<S>) => {
  const [s, setS] = useState(b$.value);
  useEffect(() => lazyUnsubscribe(b$.subscribe(setS)), [b$]);
  return s;
};

/**
 * @param o$ An rxjs `Observable` that sets a new state with whatever comes through the stream pipeline.
 * @param initialState First state value.
 * @returns Latest state value.
 */
export const useObservableState = <S>(
  o$: Observable<S>,
  initialState: S | (() => S)
) => {
  const [s, setS] = useState(initialState);
  useEffect(() => {
    const sub = o$.subscribe(setS);
    return () => sub.unsubscribe();
  }, [o$]);
  return s;
};
