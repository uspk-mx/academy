import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes"

export default [
  ...prefix(":lang", [
    route("logout", "./routes/logout.tsx"),
    // The course viewer owns the whole screen (its own sidebar and header), so
    // it sits outside the dashboard layout rather than nested inside it.
    ...prefix("courses/:cid", [
      route("lesson/:lessonId", "./routes/courses/course/lesson.tsx"),
      route("quiz/:quizId", "./routes/courses/course/quiz.tsx"),
    ]),
    // Resource route (action only) for grading practice-bite submissions.
    route("practice-bite", "./routes/practice-bite.tsx"),
    // Dev-only certificate PDF preview (404s in prod). See the route file.
    route("cert-preview", "./routes/cert-preview.tsx"),
    layout("./routes/layout.tsx", [
      ...prefix("dashboard", [
        index("./routes/dashboard.tsx"),
        route("courses", "./routes/courses/courses.tsx"),
        route("profile", "./routes/profile.tsx"),
        route("reviews", "./routes/reviews.tsx"),
        route("quiz-attempts", "./routes/quiz-attempts.tsx"),
        route("certificates", "./routes/certificates.tsx"),
        route("subscription", "./routes/subscription.tsx"),
        route("order-history", "./routes/order-history.tsx"),
        // Company-admin only (the loaders guard by role and redirect others).
        route("team", "./routes/business/team.tsx"),
        route("reports", "./routes/business/reports.tsx"),
      ]),
    ]),
  ]),
  // Catch-all: redirect lang-less paths to their locale-prefixed route.
  // PostHog reverse proxy (prod parity with the dev Vite proxy).
  route("ingest/*", "./routes/ingest.ts"),
  // Keep the logged-in LMS out of search indexes.
  route("robots.txt", "./routes/robots.ts"),
  route("*", "./routes/lang-splat.tsx"),
] satisfies RouteConfig
