import { Subscription } from "rxjs";

export const lazyUnsubscribe = (s: Subscription) => () => s.unsubscribe();