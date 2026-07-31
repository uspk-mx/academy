import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes"

/**
 * The admin panel is an internal, Spanish-only back office, so unlike the web
 * and student apps it carries no `:lang` prefix — the paths mirror the ones the
 * previous admin app served.
 */
export default [
  route("login", "./routes/auth/login.tsx"),
  route("logout", "./routes/auth/logout.tsx"),
  route("signup", "./routes/auth/signup.tsx"),
  route("invite", "./routes/auth/invite.tsx"),
  route("password/reset", "./routes/auth/reset-password.tsx"),
  route("password/change", "./routes/auth/change-password.tsx"),

  layout("./routes/layout.tsx", [
    index("./routes/home.tsx"),
    ...prefix("courses", [
      index("./routes/courses/courses.tsx"),
      route("levels", "./routes/courses/levels.tsx"),
      route("categories", "./routes/courses/categories.tsx"),
      route("enrollments", "./routes/enrollments/enrollments.tsx"),
    ]),
    route("bundles", "./routes/bundles/bundles.tsx"),
    route("learning-paths", "./routes/learning-paths/learning-paths.tsx"),
    route("students", "./routes/students/students.tsx"),
    route("instructors", "./routes/instructors/instructors.tsx"),
    route("communication", "./routes/communication/communication.tsx"),
    route("performance", "./routes/performance/performance.tsx"),
    ...prefix("certificates", [
      index("./routes/certificates/certificates.tsx"),
      route("templates", "./routes/certificates/templates.tsx"),
    ]),
    route("memberships", "./routes/memberships/memberships.tsx"),
    route("companies", "./routes/companies/companies.tsx"),
    route("account/change-password", "./routes/account/change-password.tsx"),
  ]),

  // The create wizard and the builder own the whole viewport (their own chrome),
  // so they sit outside the sidebar shell.
  route("courses/create", "./routes/courses/create/create-course.tsx"),
  layout("./routes/courses/builder/builder-layout.tsx", [
    route("courses/:cid/builder", "./routes/courses/builder/settings.tsx"),
    route("courses/:cid/curriculum", "./routes/courses/builder/curriculum.tsx"),
    route("courses/:cid/additional", "./routes/courses/builder/additional.tsx"),
    route("courses/:cid/quiz/:quizId", "./routes/courses/builder/quiz.tsx"),
    route(
      "courses/:cid/lesson/:lessonId/practice",
      "./routes/courses/builder/practice-bites.tsx"
    ),
  ]),

  // PostHog reverse proxy (prod parity with the dev Vite proxy).
  route("ingest/*", "./routes/ingest.ts"),
  route("robots.txt", "./routes/robots.ts"),
] satisfies RouteConfig
