import { useFetcherOutcome } from "@academy/admin-ui/hooks/use-fetcher-outcome"
import { getAdminCourse } from "@academy/courses-api/graphql/admin-app/queries/courses"
import { updateCourse } from "@academy/courses-api/graphql/admin-app/mutations/courses"
import { adminAuthMiddleware } from "@academy/admin-ui/middleware/auth"
import { Pill } from "@academy/user-ui/components/brand/primitives"
import { BrandButton } from "@academy/user-ui/components/brand/brand-button"
import { IconButton } from "@academy/admin-ui/components/ui/icon-button"
import { IconArrowLeft } from "@tabler/icons-react"
import { Link, NavLink, Outlet, useFetcher } from "react-router"
import type { Route } from "./+types/builder-layout"

export const middleware = [adminAuthMiddleware]

export async function loader({ request, params }: Route.LoaderArgs) {
  const { course } = await getAdminCourse(request, params.cid)
  return {
    courseId: course.id,
    title: course.title,
    status: course.status ?? "DRAFT",
  }
}

/** Publish / unpublish lives on the layout so every builder tab can trigger it. */
export async function action({ request, params }: Route.ActionArgs) {
  const form = await request.formData()
  const status = String(form.get("status") ?? "")
  const title = String(form.get("title") ?? "")

  const { error } = await updateCourse(request, {
    id: params.cid,
    // `title` is non-null on UpdateCourseInput, so it rides along untouched.
    input: { title, status: status as "PUBLISHED" | "DRAFT" | "IN_PAUSE" },
  })

  return error ? { error: error.message } : { ok: true }
}

const TABS = [
  { to: "builder", label: "Ajustes" },
  { to: "curriculum", label: "Currículum" },
  { to: "additional", label: "Datos adicionales" },
]

const STATUS_LABEL: Record<string, string> = {
  PUBLISHED: "Publicado",
  DRAFT: "Borrador",
  IN_PAUSE: "En pausa",
}

export default function BuilderLayout({ loaderData }: Route.ComponentProps) {
  const { courseId, title, status } = loaderData
  const fetcher = useFetcher<{ error?: string; ok?: boolean }>()

  useFetcherOutcome(fetcher, {
    successMessage: "Estado actualizado",
  })

  const isPublished = status === "PUBLISHED"

  return (
    <div className="min-h-svh bg-surface-page">
      <header className="sticky top-0 z-10 border-b-2 border-border-strong bg-surface-card">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-3">
          <div className="flex items-center gap-3">
            <IconButton to="/courses">
              <IconArrowLeft className="size-4" />
              <span className="sr-only">Volver a cursos</span>
            </IconButton>
            <h1 className="flex-1 truncate font-heading font-medium">{title}</h1>
            <Pill tone={isPublished ? "ink" : "white"}>
              {STATUS_LABEL[status] ?? status}
            </Pill>
            <BrandButton
              variant={isPublished ? "outline" : "primary"}
              disabled={fetcher.state !== "idle"}
              onClick={() =>
                fetcher.submit(
                  { title, status: isPublished ? "DRAFT" : "PUBLISHED" },
                  { method: "post" }
                )
              }
            >
              {isPublished ? "Pasar a borrador" : "Publicar"}
            </BrandButton>
          </div>

          <nav className="flex gap-1">
            {TABS.map((tab) => (
              <NavLink
                key={tab.to}
                to={`/courses/${courseId}/${tab.to}`}
                className={({ isActive }) =>
                  `rounded-xl px-3 py-1.5 text-sm transition-colors ${
                    isActive
                      ? "bg-academy-yellow font-bold"
                      : "text-content-muted hover:bg-academy-yellow-soft"
                  }`
                }
              >
                {tab.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-6xl p-6">
        <Outlet />
      </div>
    </div>
  )
}
