import { useEffect, useState } from "react"

export function useCountdown(target?: string) {
  const [label, setLabel] = useState<string | null>(null)

  useEffect(() => {
    if (!target) return
    const end = new Date(target).getTime()

    function tick() {
      const diff = end - Date.now()
      if (diff <= 0) {
        setLabel(null)
        return
      }

      const d = Math.floor(diff / 86_400_000)
      const h = Math.floor((diff % 86_400_000) / 3_600_000)
      const m = Math.floor((diff % 3_600_000) / 60_000)
      const s = Math.floor((diff % 60_000) / 1000)

      setLabel(
        `${d}d ${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s
          .toString()
          .padStart(2, "0")}`
      )
    }

    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [target])

  return label
}
