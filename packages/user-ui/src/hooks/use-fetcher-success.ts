import { useEffect, useRef } from "react"
import type { FetcherWithComponents } from "react-router"

/**
 * Runs `onSuccess` once for each submission that returns `{ ok: true }`.
 *
 * Fires the moment the result arrives (while the fetcher is still
 * "loading"/revalidating) rather than waiting for "idle". This matters for
 * items that delete themselves: by the time the fetcher reaches "idle" the row
 * has been removed and its component unmounted, so an "idle"-based effect would
 * never run. Dedupes on the data reference so it never double-fires.
 */
export function useFetcherSuccess<T>(
  fetcher: FetcherWithComponents<T>,
  onSuccess: () => void
) {
  const handled = useRef<T | null>(null)

  useEffect(() => {
    if (fetcher.data && fetcher.data !== handled.current && fetcher.data) {
      handled.current = fetcher.data
      onSuccess()
    }
  }, [fetcher.data, onSuccess])
}
