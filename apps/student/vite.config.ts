import { reactRouter } from "@react-router/dev/vite"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig, loadEnv } from "vite"

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")

  return {
    plugins: [tailwindcss(), reactRouter()],
    resolve: {
      tsconfigPaths: true,
    },
    ssr: {
      noExternal: [
        "posthog-js",
        "@posthog/react",
        // sanitize-html (CJS) requires htmlparser2 v12, which is ESM-only, so a
        // runtime require() crashes on Vercel's Node (ERR_REQUIRE_ESM). Bundle
        // the whole family into the SSR build so the interop is resolved at
        // build time instead of require()'d at runtime.
        "sanitize-html",
        "htmlparser2",
        "domhandler",
        "domutils",
        "domelementtype",
        "entities",
        // sanitize-html's own deps — bundle them too, or they're require()'d from
        // node_modules at runtime and Vercel's function may not include them
        // (escape-string-regexp v5 is ESM-only → "Cannot find module").
        "deepmerge",
        "escape-string-regexp",
        "is-plain-object",
        "parse-srcset",
        "postcss",
        "launder",
      ],
    },
    server: {
      proxy: {
        "/ingest/static": {
          target: "https://us-assets.i.posthog.com",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/ingest/, ""),
        },
        "/ingest/array": {
          target: "https://us-assets.i.posthog.com",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/ingest/, ""),
        },
        "/ingest": {
          target: env.VITE_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/ingest/, ""),
        },
      },
    },
  }
})
