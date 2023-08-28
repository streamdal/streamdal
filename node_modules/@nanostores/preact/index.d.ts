import { MapStore, Store, StoreValue } from 'nanostores'

export interface UseStoreOptions<
  SomeStore,
  Key extends string | number | symbol
> {
  keys?: SomeStore extends MapStore ? Key[] : never
}

/**
 * Subscribe to store changes and get store’s value.
 *
 * Can be user with store builder too.
 *
 * ```js
 * import { useStore } from 'nanostores/preact'
 *
 * import { router } from '../store/router'
 *
 * export const Layout = () => {
 *   let page = useStore(router)
 *   if (page.router === 'home') {
 *     return <HomePage />
 *   } else {
 *     return <Error404 />
 *   }
 * }
 * ```
 *
 * @param store Store instance.
 * @returns Store value.
 */
export function useStore<
  SomeStore extends Store,
  Key extends keyof StoreValue<SomeStore>
>(
  store: SomeStore,
  options?: UseStoreOptions<SomeStore, Key>
): SomeStore extends MapStore
  ? Pick<StoreValue<SomeStore>, Key>
  : StoreValue<SomeStore>

/**
 * Batch React updates. It is just wrap for React’s `unstable_batchedUpdates`
 * with fix for React Native.
 *
 * ```js
 * import { batch } from 'nanostores/preact'
 *
 * React.useEffect(() => {
 *   let unbind = store.listen(() => {
 *     batch(() => {
 *       forceRender({})
 *     })
 *   })
 * })
 * ```
 *
 * @param cb Callback to run in batching.
 */
export function batch(cb: () => void): void
