declare function batch<T>(callback: () => T): T;
declare class Signal<T = any> {
    constructor(value?: T);
    subscribe(fn: (value: T) => void): () => void;
    valueOf(): T;
    toString(): string;
    toJSON(): T;
    peek(): T;
    get value(): T;
    set value(value: T);
}
declare function signal<T>(value: T): Signal<T>;
interface ReadonlySignal<T = any> extends Signal<T> {
    readonly value: T;
}
declare function computed<T>(compute: () => T): ReadonlySignal<T>;
declare function effect(compute: () => void | (() => void)): () => void;
export { signal, computed, effect, batch, Signal, type ReadonlySignal };
