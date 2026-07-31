import { useFetcherOutcome } from "@academy/admin-ui/hooks/use-fetcher-outcome"
import { getAdminCurriculum } from "@academy/courses-api/graphql/admin-app/queries/courses"
import {
  createLesson,
  createQuiz,
  createTopic,
  deleteLesson,
  deleteQuiz,
  deleteTopic,
  updateLesson,
  updateQuiz,
  updateTopic,
} from "@academy/courses-api/graphql/admin-app/mutations/curriculum"
import { DeleteDialog } from "@academy/admin-ui/components/shared/delete-dialog"
import { EmptyState } from "@academy/admin-ui/components/shared/empty-state"
import { FormSheet } from "@academy/admin-ui/components/shared/form-sheet"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@academy/admin-ui/components/ui/collapsible"
import { MediaField } from "@academy/admin-ui/components/shared/media-field"
import { Field } from "@academy/admin-ui/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@academy/admin-ui/components/ui/select"
import { Pill } from "@academy/user-ui/components/brand/primitives"
import { BrandButton } from "@academy/user-ui/components/brand/brand-button"
import { IconButton } from "@academy/admin-ui/components/ui/icon-button"
import { Checkbox } from "@academy/user-ui/components/ui/checkbox"
import { Input } from "@academy/admin-ui/components/ui/input"
import { Textarea } from "@academy/admin-ui/components/ui/input"
import {
  IconChevronRight,
  IconFileText,
  IconHelpCircle,
  IconPencil,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react"
import { useState } from "react"
import { Link, useFetcher } from "react-router"
import type { Route } from "./+types/curriculum"

export function meta() {
  return [{ title: "USPK Academy | Currículum" }]
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const { topicsByCourseId } = await getAdminCurriculum(request, params.cid)
  return { topics: topicsByCourseId }
}

function optionalNumber(form: FormData, key: string): number | null {
  const value = String(form.get(key) ?? "").trim()
  if (!value) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

export async function action({ request, params }: Route.ActionArgs) {
  const form = await request.formData()
  const intent = String(form.get("intent") ?? "")
  const id = String(form.get("id") ?? "")

  switch (intent) {
    case "topic-create": {
      const { error } = await createTopic(request, {
        input: {
          courseID: params.cid,
          title: String(form.get("title") ?? "").trim(),
          description: String(form.get("description") ?? "").trim() || null,
          position: optionalNumber(form, "position"),
        },
      })
      return error ? { error: error.message } : { ok: true }
    }

    case "topic-update": {
      const { error } = await updateTopic(request, {
        id,
        input: {
          title: String(form.get("title") ?? "").trim(),
          description: String(form.get("description") ?? "").trim() || null,
          position: optionalNumber(form, "position"),
        },
      })
      return error ? { error: error.message } : { ok: true }
    }

    case "topic-delete": {
      const { error } = await deleteTopic(request, { id })
      return error ? { error: error.message } : { ok: true }
    }

    case "lesson-create": {
      const { error } = await createLesson(request, {
        input: {
          topicId: String(form.get("topicId") ?? ""),
          title: String(form.get("title") ?? "").trim(),
          content: String(form.get("content") ?? ""),
          position: optionalNumber(form, "position") ?? 0,
          featuredImage: String(form.get("featuredImage") ?? "").trim() || null,
          showPreview: form.get("showPreview") === "on",
          video: videoInput(form),
        },
      })
      return error ? { error: error.message } : { ok: true }
    }

    case "lesson-update": {
      const { error } = await updateLesson(request, {
        id,
        input: {
          title: String(form.get("title") ?? "").trim(),
          content: String(form.get("content") ?? ""),
          position: optionalNumber(form, "position"),
          featuredImage: String(form.get("featuredImage") ?? "").trim() || null,
          showPreview: form.get("showPreview") === "on",
          video: videoInput(form),
        },
      })
      return error ? { error: error.message } : { ok: true }
    }

    case "lesson-delete": {
      const { error } = await deleteLesson(request, { id })
      return error ? { error: error.message } : { ok: true }
    }

    case "quiz-create": {
      const { error } = await createQuiz(request, {
        input: {
          topicID: String(form.get("topicId") ?? ""),
          title: String(form.get("title") ?? "").trim(),
          content: String(form.get("content") ?? "").trim() || null,
          timer: optionalNumber(form, "timer"),
          timeUnit: String(form.get("timeUnit") ?? "").trim() || null,
          maxAttempts: optionalNumber(form, "maxAttempts"),
          passingGrade: optionalNumber(form, "passingGrade"),
          position: optionalNumber(form, "position"),
        },
      })
      return error ? { error: error.message } : { ok: true }
    }

    case "quiz-update": {
      const { error } = await updateQuiz(request, {
        id,
        input: {
          title: String(form.get("title") ?? "").trim(),
          content: String(form.get("content") ?? "").trim() || null,
          timer: optionalNumber(form, "timer"),
          timeUnit: String(form.get("timeUnit") ?? "").trim() || null,
          maxAttempts: optionalNumber(form, "maxAttempts"),
          passingGrade: optionalNumber(form, "passingGrade"),
          position: optionalNumber(form, "position"),
        },
      })
      return error ? { error: error.message } : { ok: true }
    }

    case "quiz-delete": {
      const { error } = await deleteQuiz(request, { id })
      return error ? { error: error.message } : { ok: true }
    }

    default:
      return { error: "Acción no reconocida." }
  }
}

/** A lesson video is all-or-nothing: without a URL the field must stay unset. */
function videoInput(form: FormData) {
  const videoURL = String(form.get("videoURL") ?? "").trim()
  if (!videoURL) return null
  return {
    videoURL,
    source: String(form.get("videoSource") ?? "").trim() || null,
    duration: (() => {
      const value = String(form.get("videoDuration") ?? "").trim()
      const parsed = Number(value)
      return value && Number.isFinite(parsed) ? parsed : null
    })(),
  }
}

type Topic = Route.ComponentProps["loaderData"]["topics"][number]
type Lesson = NonNullable<Topic["lessons"]>[number]
type Quiz = NonNullable<Topic["quizzes"]>[number]

type Editing =
  | { kind: "topic"; topic: Topic | null }
  | { kind: "lesson"; topicId: string; lesson: Lesson | null }
  | { kind: "quiz"; topicId: string; quiz: Quiz | null }

type Deleting = { intent: string; id: string; type: string; name: string }

export default function CurriculumRoute({
  loaderData,
  params,
}: Route.ComponentProps) {
  const { topics } = loaderData
  const fetcher = useFetcher<{ error?: string; ok?: boolean }>()
  const [editing, setEditing] = useState<Editing | null>(null)
  const [deleting, setDeleting] = useState<Deleting | null>(null)

  const submitting = fetcher.state !== "idle"

  useFetcherOutcome(fetcher, {
    onSuccess: () => {
        setEditing(null)
        setDeleting(null)
    },
  })

  const dialogs = (
    <>
      {editing?.kind === "topic" && (
        <TopicSheet
          topic={editing.topic}
          nextPosition={topics.length + 1}
          submitting={submitting}
          fetcher={fetcher}
          onClose={() => setEditing(null)}
        />
      )}
      {editing?.kind === "lesson" && (
        <LessonSheet
          topicId={editing.topicId}
          lesson={editing.lesson}
          submitting={submitting}
          fetcher={fetcher}
          onClose={() => setEditing(null)}
        />
      )}
      {editing?.kind === "quiz" && (
        <QuizSheet
          topicId={editing.topicId}
          quiz={editing.quiz}
          submitting={submitting}
          fetcher={fetcher}
          onClose={() => setEditing(null)}
        />
      )}

      <DeleteDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        resourceType={deleting?.type ?? ""}
        resourceName={deleting?.name}
        isLoading={submitting}
        onConfirm={() =>
          fetcher.submit(
            { intent: deleting?.intent ?? "", id: deleting?.id ?? "" },
            { method: "post" }
          )
        }
      />
    </>
  )

  if (topics.length === 0) {
    return (
      <>
        <EmptyState
          title="El currículum está vacío"
          description="Empieza creando un tema; dentro podrás añadir lecciones y quizzes."
          actionLabel="Nuevo tema"
          onAction={() => setEditing({ kind: "topic", topic: null })}
        />
        {dialogs}
      </>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-card-title leading-display font-bold tracking-tight-brand">Currículum</h2>
        <BrandButton onClick={() => setEditing({ kind: "topic", topic: null })}>
          <IconPlus className="size-4" />
          Nuevo tema
        </BrandButton>
      </div>

      {topics.map((topic) => (
        <Collapsible
          key={topic.id}
          defaultOpen
          className="rounded-card border-2 border-border-strong bg-surface-card shadow-hard-xs"
        >
          <div className="flex items-center gap-2 p-4">
            <CollapsibleTrigger
              className="flex size-6 items-center justify-center rounded-md text-content-muted transition-transform hover:bg-academy-yellow-soft data-panel-open:rotate-90"
              aria-label={`Alternar ${topic.title ?? "tema"}`}
            >
              <IconChevronRight className="size-4" />
            </CollapsibleTrigger>

            <div className="flex-1">
              <h3 className="font-bold">{topic.title ?? "Sin título"}</h3>
              {topic.description && (
                <p className="text-sm text-content-muted">
                  {topic.description}
                </p>
              )}
            </div>

            <Pill tone="white">
              {(topic.lessons?.length ?? 0) + (topic.quizzes?.length ?? 0)} ítems
            </Pill>

            <IconButton
                            aria-label="Editar tema"
              onClick={() => setEditing({ kind: "topic", topic })}
            >
              <IconPencil className="size-4" />
            </IconButton>
            <IconButton
                            aria-label="Eliminar tema"
              onClick={() =>
                setDeleting({
                  intent: "topic-delete",
                  id: topic.id,
                  type: "Tema",
                  name: topic.title ?? "",
                })
              }
            >
              <IconTrash className="size-4" />
            </IconButton>
          </div>

          <CollapsibleContent>
            <div className="space-y-1 border-t-2 border-border-subtle p-3">
              {topic.lessons?.map((lesson) => (
                <div
                  key={lesson.id}
                  className="flex items-center gap-2 rounded-button px-3 py-2 hover:bg-academy-yellow-soft"
                >
                  <IconFileText className="size-4 text-content-muted" />
                  <span className="flex-1 text-sm">{lesson.title}</span>
                  {lesson.showPreview && (
                    <Pill tone="white">Vista previa</Pill>
                  )}
                  <Link
                    to={`/courses/${params.cid}/lesson/${lesson.id}/practice`}
                    className="text-label font-bold text-action-secondary underline-offset-2 hover:underline"
                  >
                    Práctica ({lesson.practiceBites?.length ?? 0})
                  </Link>
                  <IconButton
                    aria-label="Editar lección"
                    onClick={() =>
                      setEditing({ kind: "lesson", topicId: topic.id, lesson })
                    }
                  >
                    <IconPencil className="size-4" />
                  </IconButton>
                  <IconButton
                    destructive
                    aria-label="Eliminar lección"
                    onClick={() =>
                      setDeleting({
                        intent: "lesson-delete",
                        id: lesson.id,
                        type: "Lección",
                        name: lesson.title,
                      })
                    }
                  >
                    <IconTrash className="size-4" />
                  </IconButton>
                </div>
              ))}

              {topic.quizzes?.map((quiz) => (
                <div
                  key={quiz.id}
                  className="flex items-center gap-2 rounded-button px-3 py-2 hover:bg-academy-yellow-soft"
                >
                  <IconHelpCircle className="size-4 text-content-muted" />
                  <Link
                    to={`/courses/${params.cid}/quiz/${quiz.id}`}
                    className="flex-1 text-sm hover:underline"
                  >
                    {quiz.title}
                  </Link>
                  <Pill tone="white">
                    {quiz.questions?.length ?? 0} preguntas
                  </Pill>
                  <IconButton
                                        aria-label="Editar quiz"
                    onClick={() =>
                      setEditing({ kind: "quiz", topicId: topic.id, quiz })
                    }
                  >
                    <IconPencil className="size-4" />
                  </IconButton>
                  <IconButton
                                        aria-label="Eliminar quiz"
                    onClick={() =>
                      setDeleting({
                        intent: "quiz-delete",
                        id: quiz.id,
                        type: "Quiz",
                        name: quiz.title,
                      })
                    }
                  >
                    <IconTrash className="size-4" />
                  </IconButton>
                </div>
              ))}

              <div className="flex gap-2 pt-2">
                <BrandButton
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setEditing({ kind: "lesson", topicId: topic.id, lesson: null })
                  }
                >
                  <IconPlus className="size-4" />
                  Lección
                </BrandButton>
                <BrandButton
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setEditing({ kind: "quiz", topicId: topic.id, quiz: null })
                  }
                >
                  <IconPlus className="size-4" />
                  Quiz
                </BrandButton>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      ))}

      {dialogs}
    </div>
  )
}

type FetcherLike = ReturnType<typeof useFetcher<{ error?: string; ok?: boolean }>>

function TopicSheet({
  topic,
  nextPosition,
  submitting,
  fetcher,
  onClose,
}: {
  topic: Topic | null
  nextPosition: number
  submitting: boolean
  fetcher: FetcherLike
  onClose: () => void
}) {
  return (
    <FormSheet
      open
      onOpenChange={(open) => !open && onClose()}
      title={topic ? "Editar tema" : "Nuevo tema"}
      description="Los temas agrupan las lecciones y quizzes del curso."
      formId="topic-form"
      submitLabel={topic ? "Guardar cambios" : "Crear tema"}
      submitting={submitting}
    >
      <fetcher.Form method="post" id="topic-form" className="space-y-4 pt-2">
        <input
          type="hidden"
          name="intent"
          value={topic ? "topic-update" : "topic-create"}
        />
        {topic && <input type="hidden" name="id" value={topic.id} />}

        <Field label="Título" htmlFor="title" required>
          <Input id="title" name="title" defaultValue={topic?.title ?? ""} required />
        </Field>
        <Field label="Descripción" htmlFor="description">
          <Textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={topic?.description ?? ""}
          />
        </Field>
        <Field label="Posición" htmlFor="position" hint="Orden dentro del curso.">
          <Input
            id="position"
            name="position"
            type="number"
            min="0"
            defaultValue={topic?.position ?? nextPosition}
          />
        </Field>
      </fetcher.Form>
    </FormSheet>
  )
}

function LessonSheet({
  topicId,
  lesson,
  submitting,
  fetcher,
  onClose,
}: {
  topicId: string
  lesson: Lesson | null
  submitting: boolean
  fetcher: FetcherLike
  onClose: () => void
}) {
  return (
    <FormSheet
      open
      onOpenChange={(open) => !open && onClose()}
      title={lesson ? "Editar lección" : "Nueva lección"}
      formId="lesson-form"
      submitLabel={lesson ? "Guardar cambios" : "Crear lección"}
      submitting={submitting}
      className="sm:max-w-xl"
    >
      <fetcher.Form method="post" id="lesson-form" className="space-y-4 pt-2">
        <input
          type="hidden"
          name="intent"
          value={lesson ? "lesson-update" : "lesson-create"}
        />
        <input type="hidden" name="topicId" value={topicId} />
        {lesson && <input type="hidden" name="id" value={lesson.id} />}

        <Field label="Título" htmlFor="title" required>
          <Input id="title" name="title" defaultValue={lesson?.title ?? ""} required />
        </Field>

        <Field
          label="Contenido"
          htmlFor="content"
          hint="Admite HTML — se sanea antes de mostrarse al alumno."
        >
          <Textarea
            id="content"
            name="content"
            rows={10}
            defaultValue={lesson?.content ?? ""}
            className="font-mono text-xs"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <MediaField
            label="Video"
            name="videoURL"
            folder="lessons/video"
            accept="video/*"
            preview={false}
            defaultValue={lesson?.video?.videoURL}
          />
          <Field label="Fuente" htmlFor="videoSource">
            <Input
              id="videoSource"
              name="videoSource"
              defaultValue={lesson?.video?.source ?? ""}
              placeholder="youtube, vimeo..."
            />
          </Field>
          <Field label="Duración del video (seg)" htmlFor="videoDuration">
            <Input
              id="videoDuration"
              name="videoDuration"
              type="number"
              min="0"
              defaultValue={lesson?.video?.duration ?? ""}
            />
          </Field>
          <Field label="Posición" htmlFor="position">
            <Input
              id="position"
              name="position"
              type="number"
              min="0"
              defaultValue={lesson?.position ?? 0}
            />
          </Field>
        </div>

        <MediaField
          label="Imagen destacada"
          name="featuredImage"
          folder="lessons"
          defaultValue={lesson?.featuredImage}
        />

        <label className="flex items-center gap-2.5 text-sm">
          <Checkbox name="showPreview" defaultChecked={lesson?.showPreview ?? false} />
          Disponible como vista previa gratuita
        </label>
      </fetcher.Form>
    </FormSheet>
  )
}

function QuizSheet({
  topicId,
  quiz,
  submitting,
  fetcher,
  onClose,
}: {
  topicId: string
  quiz: Quiz | null
  submitting: boolean
  fetcher: FetcherLike
  onClose: () => void
}) {
  return (
    <FormSheet
      open
      onOpenChange={(open) => !open && onClose()}
      title={quiz ? "Editar quiz" : "Nuevo quiz"}
      description="Las preguntas se administran en la pantalla del quiz."
      formId="quiz-form"
      submitLabel={quiz ? "Guardar cambios" : "Crear quiz"}
      submitting={submitting}
    >
      <fetcher.Form method="post" id="quiz-form" className="space-y-4 pt-2">
        <input
          type="hidden"
          name="intent"
          value={quiz ? "quiz-update" : "quiz-create"}
        />
        <input type="hidden" name="topicId" value={topicId} />
        {quiz && <input type="hidden" name="id" value={quiz.id} />}

        <Field label="Título" htmlFor="title" required>
          <Input id="title" name="title" defaultValue={quiz?.title ?? ""} required />
        </Field>

        <Field label="Instrucciones" htmlFor="content">
          <Textarea
            id="content"
            name="content"
            rows={4}
            defaultValue={quiz?.content ?? ""}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tiempo límite" htmlFor="timer" hint="Vacío = sin límite.">
            <Input
              id="timer"
              name="timer"
              type="number"
              min="0"
              defaultValue={quiz?.timer ?? ""}
            />
          </Field>
          <Field label="Unidad" htmlFor="timeUnit">
            <Select name="timeUnit" defaultValue={quiz?.timeUnit ?? "minutes"}>
              <SelectTrigger id="timeUnit">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="seconds">Segundos</SelectItem>
                <SelectItem value="minutes">Minutos</SelectItem>
                <SelectItem value="hours">Horas</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field
            label="Intentos máximos"
            htmlFor="maxAttempts"
            hint="Vacío = ilimitados."
          >
            <Input
              id="maxAttempts"
              name="maxAttempts"
              type="number"
              min="1"
              defaultValue={quiz?.maxAttempts ?? ""}
            />
          </Field>
          <Field label="Calificación mínima (%)" htmlFor="passingGrade">
            <Input
              id="passingGrade"
              name="passingGrade"
              type="number"
              min="0"
              max="100"
              defaultValue={quiz?.passingGrade ?? 70}
            />
          </Field>
        </div>

        <Field label="Posición" htmlFor="position">
          <Input
            id="position"
            name="position"
            type="number"
            min="0"
            defaultValue={quiz?.position ?? 0}
          />
        </Field>
      </fetcher.Form>
    </FormSheet>
  )
}
