import { useEffect, useRef } from "react"
import { toast } from "sonner"

export interface ActionOutcome {
  ok?: boolean
  error?: string
  message?: string
}

/**
 * Runs `onSuccess` exactly once per completed fetcher submission.
 *
 * Watching `fetcher.data` alone is not enough: two consecutive writes both
 * return `{ ok: true }`, and if the decoded payload compares equal the effect
 * never re-runs — so the second submit leaves its dialog open. Tracking the
 * idle→busy→idle transition instead makes the callback fire per submission
 * regardless of what the action returned.
 */
export function useFetcherOutcome(
  fetcher: { state: string; data?: ActionOutcome },
  {
    onSuccess,
    successMessage = "Cambios guardados",
  }: { onSuccess?: () => void; successMessage?: string } = {}
) {
  const wasBusy = useRef(false)

  useEffect(() => {
    const busy = fetcher.state !== "idle"
    const justFinished = wasBusy.current && !busy
    wasBusy.current = busy

    if (!justFinished) return

    if (fetcher.data?.error) {
      toast.error(fetcher.data.error)
      return
    }
    if (fetcher.data?.ok) {
      toast.success(fetcher.data.message ?? successMessage)
      onSuccess?.()
    }
    // `onSuccess` is re-created every render by callers; depending on it here
    // would re-run the effect without a state change and double-fire.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher.state, fetcher.data])
}
