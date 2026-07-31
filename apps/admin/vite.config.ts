import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv } from 'vite';

const reactExternals = [
  "react",
  "react/jsx-runtime",
  "react/jsx-dev-runtime",
  "react-dom",
  "react-dom/client",
  "react-dom/server",
]

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")
  const inDocker = !!process.env.DOCKER_DEV

  return {
    plugins: [tailwindcss(), reactRouter()],
    resolve: {
      tsconfigPaths: true,
    },
    ssr: {
      noExternal: true,
      external: [
        ...reactExternals,
        // CJS-only; forcing it through the ESM module runner blows up with
        // "module is not defined" during dev SSR. Reaches us via sonner.
        "use-sync-external-store",
      ],
    },
    server: {
      host: inDocker,
      watch: inDocker ? { usePolling: true } : undefined,
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
