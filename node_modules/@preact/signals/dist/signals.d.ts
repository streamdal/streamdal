import { signal, computed, batch, effect, Signal, type ReadonlySignal } from "@preact/signals-core";
export { signal, computed, batch, effect, Signal, type ReadonlySignal };
export declare function useSignal<T>(value: T): Signal<T>;
export declare function useComputed<T>(compute: () => T): ReadonlySignal<T>;
export declare function useSignalEffect(cb: () => void | (() => void)): void;
/**
 * @todo Determine which Reactive implementation we'll be using.
 * @internal
 */
/**
 * @internal
 * Update a Reactive's using the properties of an object or other Reactive.
 * Also works for Signals.
 * @example
 *   // Update a Reactive with Object.assign()-like syntax:
 *   const r = reactive({ name: "Alice" });
 *   update(r, { name: "Bob" });
 *   update(r, { age: 42 }); // property 'age' does not exist in type '{ name?: string }'
 *   update(r, 2); // '2' has no properties in common with '{ name?: string }'
 *   console.log(r.name.value); // "Bob"
 *
 * @example
 *   // Update a Reactive with the properties of another Reactive:
 *   const A = reactive({ name: "Alice" });
 *   const B = reactive({ name: "Bob", age: 42 });
 *   update(A, B);
 *   console.log(`${A.name} is ${A.age}`); // "Bob is 42"
 *
 * @example
 *   // Update a signal with assign()-like syntax:
 *   const s = signal(42);
 *   update(s, "hi"); // Argument type 'string' not assignable to type 'number'
 *   update(s, {}); // Argument type '{}' not assignable to type 'number'
 *   update(s, 43);
 *   console.log(s.value); // 43
 *
 * @param obj The Reactive or Signal to be updated
 * @param update The value, Signal, object or Reactive to update `obj` to match
 * @param overwrite If `true`, any properties `obj` missing from `update` are set to `undefined`
 */
