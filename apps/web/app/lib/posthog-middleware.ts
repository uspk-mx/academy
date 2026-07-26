import { PostHog } from "posthog-node"

export interface PostHogContext {
  posthog?: PostHog
}

export async function posthogMiddleware(
  { request, context }: { request: Request; context: any },
  next: () => Promise<Response>
): Promise<Response> {
  const token = process.env.VITE_PUBLIC_POSTHOG_PROJECT_TOKEN
  const host = process.env.VITE_PUBLIC_POSTHOG_HOST

  if (!token) {
    if (process.env.NODE_ENV !== "production") {
      console.error(
        "VITE_PUBLIC_POSTHOG_PROJECT_TOKEN variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once VITE_PUBLIC_POSTHOG_PROJECT_TOKEN is configured"
      )
    }
    return next()
  }

  const posthog = new PostHog(token, {
    host: host ?? "https://us.i.posthog.com",
    flushAt: 1,
    flushInterval: 0,
  })

  const sessionId = request.headers.get("X-POSTHOG-SESSION-ID")
  const distinctId = request.headers.get("X-POSTHOG-DISTINCT-ID")

  ;(context as PostHogContext).posthog = posthog

  const response = await posthog.withContext(
    {
      sessionId: sessionId ?? undefined,
      distinctId: distinctId ?? undefined,
    },
    next
  )

  await posthog.shutdown().catch(() => {})

  return response
}
