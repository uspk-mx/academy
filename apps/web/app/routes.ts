import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes"

export default [
  ...prefix(":lang", [
    route("login", "./routes/auth/login.tsx"),
    route("logout", "./routes/auth/logout.tsx"),
    route("signup", "./routes/auth/signup.tsx"),
    route("confirm-account", "./routes/auth/confirm-account.tsx"),
    route("forgot-password", "./routes/auth/forgot-password.tsx"),
    route("change-password", "./routes/auth/change-password.tsx"),
    layout("./layout.tsx", [
      index("routes/home.tsx"),
      route("courses", "./routes/courses/courses.tsx"),
      route("courses/:id", "./routes/courses/course-details.tsx"),
      route("about", "./routes/about.tsx"),
      route("blog", "./routes/blog/blog.tsx"),
      route("blog/:slug", "./routes/blog/post.tsx"),
      route("cart", "./routes/cart.tsx"),
      route("memberships", "./routes/memberships.tsx"),
      route("memberships/:planId", "./routes/memberships/details.tsx"),
      route("checkout/success", "./routes/checkout/success.tsx"),
    ]),
    layout("./routes/checkout/checkout-layout.tsx", [
      route("checkout", "./routes/checkout.tsx"),
      route("subscribe", "./routes/subscribe.tsx"),
    ]),
  ]),
  // SEO resource routes (no locale prefix, served at the domain root).
  route("robots.txt", "./routes/robots.ts"),
  route("sitemap.xml", "./routes/sitemap.ts"),
  // PostHog reverse proxy (prod parity with the dev Vite proxy).
  route("ingest/*", "./routes/ingest.ts"),
  // Catch-all: redirect lang-less paths to their locale-prefixed route.
  route("*", "./routes/lang-splat.tsx"),
] satisfies RouteConfig
