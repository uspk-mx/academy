import { startTransition, StrictMode } from "react"
import { hydrateRoot } from "react-dom/client"
import { HydratedRouter } from "react-router/dom"

import posthog from "posthog-js"
import { PostHogProvider } from "@posthog/react"

const token = import.meta.env.VITE_PUBLIC_POSTHOG_PROJECT_TOKEN
const host = import.meta.env.VITE_PUBLIC_POSTHOG_HOST

// Warn, never throw: this module runs before `hydrateRoot`, so throwing here
// leaves the whole app server-rendered but dead — no event handlers, no client
// navigation — which looks like a styling or component bug rather than a
// missing env var. Analytics config must not be able to take the panel down.
if (import.meta.env.DEV && (!token || !host)) {
  console.warn(
    "PostHog is not configured (VITE_PUBLIC_POSTHOG_PROJECT_TOKEN / VITE_PUBLIC_POSTHOG_HOST). Analytics events are being dropped. Copy .env.example to .env to enable them."
  )
}

if (token) {
  posthog.init(token, {
    api_host: "/ingest",
    ui_host: host,
    defaults: "2026-01-30",
    __add_tracing_headers: [window.location.host, "localhost"],
  })
}

startTransition(() => {
  hydrateRoot(
    document,
    <PostHogProvider client={posthog}>
      <StrictMode>
        <HydratedRouter />
      </StrictMode>
    </PostHogProvider>
  )
})
