import { startTransition, StrictMode } from "react"
import { hydrateRoot } from "react-dom/client"
import { HydratedRouter } from "react-router/dom"

import posthog from "posthog-js"
import { PostHogProvider } from "@posthog/react"

const token = import.meta.env.VITE_PUBLIC_POSTHOG_PROJECT_TOKEN
const host = import.meta.env.VITE_PUBLIC_POSTHOG_HOST

if (import.meta.env.DEV) {
  if (!token) {
    throw new Error(
      "VITE_PUBLIC_POSTHOG_PROJECT_TOKEN variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once VITE_PUBLIC_POSTHOG_PROJECT_TOKEN is configured"
    )
  }
  if (!host) {
    throw new Error(
      "VITE_PUBLIC_POSTHOG_HOST variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once VITE_PUBLIC_POSTHOG_HOST is configured"
    )
  }
}

if (token) {
  posthog.init(token, {
    api_host: "/ingest",
    ui_host: host,
    defaults: "2026-01-30",
    __add_tracing_headers: [window.location.host, "localhost"],
  })
  // Shared PostHog project with the marketing app — tag every event so the two
  // surfaces can be told apart in dashboards.
  posthog.register({ app: "student" })
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
