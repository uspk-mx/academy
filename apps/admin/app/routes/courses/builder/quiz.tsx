import { useFetcherOutcome } from "@academy/admin-ui/hooks/use-fetcher-outcome"
import { getAdminQuiz } from "@academy/courses-api/graphql/admin-app/queries/curriculum"
import {
  createQuestion,
  deleteQuestion,
  updateQuestion,
} from "@academy/courses-api/graphql/admin-app/mutations/curriculum"
import { DeleteDialog } from "@academy/admin-ui/components/shared/delete-dialog"
import { EmptyState } from "@academy/admin-ui/components/shared/empty-state"
import { FormSheet } from "@academy/admin-ui/components/shared/form-sheet"
import { PageBreadcrumbs } from "@academy/admin-ui/components/ui/breadcrumb"
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
import { IconPencil, IconPlus, IconTrash, IconX } from "@tabler/icons-react"
import { useState } from "react"
import { useFetcher } from "react-router"
import type { Route } from "./+types/quiz"

export function meta() {
  return [{ title: "USPK Academy | Preguntas del quiz" }]
}

const QUESTION_TYPES = [
  { value: "SINGLE_CHOICE", label: "Opción única" },
  { value: "MULTIPLE_CHOICE", label: "Opción múltiple" },
  { value: "TRUE_FALSE", label: "Verdadero / Falso" },
  { value: "FREE_CHOICE", label: "Respuesta libre" },
  { value: "SORTING", label: "Ordenar" },
  { value: "MATRIX_SORTING", label: "Relacionar columnas" },
  { value: "FILL_IN_THE_BLANKS", label: "Completar espacios" },
  { value: "ASSESSMENT", label: "Evaluación" },
  { value: "ESSAY", label: "Ensayo" },
] as const

type QuestionType = (typeof QUESTION_TYPES)[number]["value"]

/** Exactly one option may be correct — the editor renders radios. */
const SINGLE_ANSWER_TYPES: QuestionType[] = [
  "SINGLE_CHOICE",
  "TRUE_FALSE",
  "ASSESSMENT",
]

/** Any number of options may be correct — checkboxes. */
const MULTI_ANSWER_TYPES: QuestionType[] = ["MULTIPLE_CHOICE", "FREE_CHOICE"]

/** Types whose answers are stored as an option list at all. */
const CHOICE_TYPES: QuestionType[] = [
  ...SINGLE_ANSWER_TYPES,
  ...MULTI_ANSWER_TYPES,
]

/** Verdadero/Falso is a fixed pair — authors pick which one is true, they do
 *  not get to invent the options. */
const TRUE_FALSE_OPTIONS = ["Verdadero", "Falso"]

export async function loader({ request, params }: Route.LoaderArgs) {
  const { quiz } = await getAdminQuiz(request, params.quizId)
  return { quiz }
}

/** Textareas collect list values one-per-line; blank lines are dropped. */
function lines(form: FormData, key: string): string[] {
  return String(form.get(key) ?? "")
    .split("\n")
    .map((value) => value.trim())
    .filter(Boolean)
}

export async function action({ request, params }: Route.ActionArgs) {
  const form = await request.formData()
  const intent = String(form.get("intent") ?? "")
  const id = String(form.get("id") ?? "")

  if (intent === "delete") {
    const { error } = await deleteQuestion(request, { id })
    return error ? { error: error.message } : { ok: true }
  }

  const type = String(form.get("type") ?? "SINGLE_CHOICE") as QuestionType
  const title = String(form.get("title") ?? "").trim()
  const description = String(form.get("description") ?? "").trim() || null
  const media = String(form.get("media") ?? "").trim() || null
  const answerExplanation =
    String(form.get("answerExplanation") ?? "").trim() || null
  const questionMark = Number(form.get("questionMark") ?? 1)
  const questionOrder = Number(form.get("questionOrder") ?? 0)

  if (!title) return { error: "El enunciado es obligatorio." }

  const questionSettings = {
    questionType: type,
    questionMark,
    answerRequired: form.get("answerRequired") === "on",
    showQuestionMark: form.get("showQuestionMark") === "on",
    randomizeQuestion: form.get("randomizeQuestion") === "on",
    sortableItems: type === "SORTING" ? lines(form, "sortableItems") : null,
    correctAnswers:
      type === "FILL_IN_THE_BLANKS" ? lines(form, "correctAnswers") : null,
    matrixMatches:
      type === "MATRIX_SORTING"
        ? lines(form, "matrixMatches").flatMap((row) => {
            // "columna A | columna B"
            const [columnA, columnB] = row.split("|").map((part) => part.trim())
            return columnA && columnB ? [{ columnA, columnB }] : []
          })
        : null,
  }

  // Answer rows arrive as parallel arrays: one `answerTitle` per option and a
  // `correctIndexes` entry for each option flagged correct.
  const answerTitles = form.getAll("answerTitle").map(String)
  const correctIndexes = new Set(form.getAll("correctIndexes").map(String))
  const updatedAt = new Date().toISOString()

  const answers = CHOICE_TYPES.includes(type)
    ? answerTitles
        .map((answerTitle, index) => ({
          type,
          title: answerTitle.trim(),
          isCorrect: correctIndexes.has(String(index)),
          order: index,
          updatedAt,
        }))
        .filter((answer) => answer.title)
    : null

  if (intent === "create") {
    const { data, error } = await createQuestion(request, {
      input: {
        quizID: params.quizId,
        title,
        type,
        description,
        media,
        questionMark,
        questionOrder,
        answerExplanation,
        questionSettings,
      },
    })

    if (error) return { error: error.message }

    const questionId = data?.createQuestion.id
    // `CreateQuestionInput` has no `answers` field, so the options captured in
    // the same form are written straight after with the new id. One submit for
    // the editor; two calls under the hood.
    if (questionId && answers?.length) {
      const followUp = await updateQuestion(request, {
        id: questionId,
        input: { answers },
      })
      if (followUp.error) {
        return {
          error: `La pregunta se creó pero sus opciones no se guardaron: ${followUp.error.message}`,
        }
      }
    }

    return { ok: true }
  }

  const { error } = await updateQuestion(request, {
    id,
    input: {
      title,
      type,
      description,
      media,
      questionMark,
      questionOrder,
      answerExplanation,
      questionSettings,
      answers,
    },
  })

  return error ? { error: error.message } : { ok: true }
}

type Question = NonNullable<
  Route.ComponentProps["loaderData"]["quiz"]["questions"]
>[number]

export default function QuizQuestionsRoute({
  loaderData,
  params,
}: Route.ComponentProps) {
  const { quiz } = loaderData
  const fetcher = useFetcher<{ error?: string; ok?: boolean }>()
  const [editing, setEditing] = useState<Question | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [deleting, setDeleting] = useState<Question | null>(null)

  const submitting = fetcher.state !== "idle"
  const questions = quiz.questions ?? []

  useFetcherOutcome(fetcher, {
    onSuccess: () => {
        setSheetOpen(false)
        setDeleting(null)
    },
  })

  const openCreate = () => {
    setEditing(null)
    setSheetOpen(true)
  }

  const dialogs = (
    <>
      {sheetOpen && (
        <QuestionSheet
          question={editing}
          nextOrder={questions.length}
          submitting={submitting}
          fetcher={fetcher}
          onClose={() => setSheetOpen(false)}
        />
      )}

      <DeleteDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        resourceType="Pregunta"
        resourceName={deleting?.title}
        isLoading={submitting}
        onConfirm={() =>
          fetcher.submit(
            { intent: "delete", id: deleting?.id ?? "" },
            { method: "post" }
          )
        }
      />
    </>
  )

  return (
    <div className="space-y-4">
      <PageBreadcrumbs
        items={[
          { label: "Currículum", href: `/courses/${params.cid}/curriculum` },
          { label: quiz.title },
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-card-title leading-display font-bold tracking-tight-brand">{quiz.title}</h2>
          <p className="text-sm text-content-muted">
            Calificación mínima {quiz.passingGrade}% ·{" "}
            {quiz.maxAttempts ? `${quiz.maxAttempts} intentos` : "Intentos ilimitados"}
          </p>
        </div>
        <BrandButton onClick={openCreate}>
          <IconPlus className="size-4" />
          Nueva pregunta
        </BrandButton>
      </div>

      {questions.length === 0 ? (
        <>
          <EmptyState
            title="Este quiz no tiene preguntas"
            description="Agrega la primera pregunta para que el quiz pueda calificarse."
            actionLabel="Nueva pregunta"
            onAction={openCreate}
          />
          {dialogs}
        </>
      ) : (
        <>
          <ol className="space-y-2">
            {questions.map((question, index) => (
              <li
                key={question.id}
                className="flex items-start gap-3 rounded-card border-2 border-border-strong bg-surface-card p-card-sm shadow-hard-xs"
              >
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-pill border-2 border-border-strong bg-academy-yellow-soft text-label font-bold">
                  {index + 1}
                </span>
                <div className="flex-1 space-y-1">
                  <p className="font-bold">{question.title}</p>
                  <div className="flex flex-wrap items-center gap-1.5 text-label text-content-muted">
                    <Pill tone="white">
                      {QUESTION_TYPES.find((item) => item.value === question.type)
                        ?.label ?? question.type}
                    </Pill>
                    <span>{question.mark} pts</span>
                    {question.answers?.length ? (
                      <span>· {question.answers.length} opciones</span>
                    ) : null}
                  </div>
                </div>
                <IconButton
                                    aria-label="Editar pregunta"
                  onClick={() => {
                    setEditing(question)
                    setSheetOpen(true)
                  }}
                >
                  <IconPencil className="size-4" />
                </IconButton>
                <IconButton
                                    aria-label="Eliminar pregunta"
                  onClick={() => setDeleting(question)}
                >
                  <IconTrash className="size-4" />
                </IconButton>
              </li>
            ))}
          </ol>
          {dialogs}
        </>
      )}
    </div>
  )
}

type FetcherLike = ReturnType<typeof useFetcher<{ error?: string; ok?: boolean }>>

function QuestionSheet({
  question,
  nextOrder,
  submitting,
  fetcher,
  onClose,
}: {
  question: Question | null
  nextOrder: number
  submitting: boolean
  fetcher: FetcherLike
  onClose: () => void
}) {
  const [type, setType] = useState<QuestionType>(
    (question?.type as QuestionType) ?? "SINGLE_CHOICE"
  )
  const [answers, setAnswers] = useState<{ title: string; isCorrect: boolean }[]>(
    () => {
      const saved = question?.answers?.map((answer) => ({
        title: answer.title,
        isCorrect: answer.isCorrect,
      }))
      if (saved?.length) return saved
      // A Verdadero/Falso question with no rows yet still needs its fixed pair,
      // otherwise the read-only inputs would render blank and unfixable.
      if (question?.type === "TRUE_FALSE") {
        return TRUE_FALSE_OPTIONS.map((title, index) => ({
          title,
          isCorrect: index === 0,
        }))
      }
      return [
        { title: "", isCorrect: true },
        { title: "", isCorrect: false },
      ]
    }
  )

  // Options are captured here for both new and existing questions; the action
  // chains create + update so the two-call API shape stays invisible.
  const canEditAnswers = CHOICE_TYPES.includes(type)
  const singleAnswer = SINGLE_ANSWER_TYPES.includes(type)
  const isTrueFalse = type === "TRUE_FALSE"

  const setAnswerAt = (
    index: number,
    patch: Partial<{ title: string; isCorrect: boolean }>
  ) =>
    setAnswers((current) =>
      current.map((answer, position) =>
        position === index ? { ...answer, ...patch } : answer
      )
    )

  /** Radio semantics: picking one option clears the rest. */
  const setOnlyCorrect = (index: number) =>
    setAnswers((current) =>
      current.map((answer, position) => ({
        ...answer,
        isCorrect: position === index,
      }))
    )

  /**
   * Switching type reshapes the option list: Verdadero/Falso is a fixed pair,
   * and moving from a multi-answer type to a single-answer one has to drop the
   * extra correct flags or the form would submit an impossible answer key.
   */
  const changeType = (next: QuestionType) => {
    setType(next)

    if (next === "TRUE_FALSE") {
      setAnswers(
        TRUE_FALSE_OPTIONS.map((title, index) => ({
          title,
          isCorrect: index === 0,
        }))
      )
      return
    }

    setAnswers((current) => {
      const usable = isTrueFalse
        ? [
            { title: "", isCorrect: true },
            { title: "", isCorrect: false },
          ]
        : current

      if (!SINGLE_ANSWER_TYPES.includes(next)) return usable

      const firstCorrect = usable.findIndex((answer) => answer.isCorrect)
      return usable.map((answer, index) => ({
        ...answer,
        isCorrect: index === (firstCorrect === -1 ? 0 : firstCorrect),
      }))
    })
  }

  return (
    <FormSheet
      open
      onOpenChange={(open) => !open && onClose()}
      title={question ? "Editar pregunta" : "Nueva pregunta"}
      formId="question-form"
      submitLabel={question ? "Guardar cambios" : "Crear pregunta"}
      submitting={submitting}
      className="sm:max-w-xl"
    >
      <fetcher.Form method="post" id="question-form" className="space-y-4 pt-2">
        <input
          type="hidden"
          name="intent"
          value={question ? "update" : "create"}
        />
        {question && <input type="hidden" name="id" value={question.id} />}
        <input type="hidden" name="type" value={type} />

        <Field label="Enunciado" htmlFor="title" required>
          <Textarea
            id="title"
            name="title"
            rows={2}
            defaultValue={question?.title ?? ""}
            required
          />
        </Field>

        <Field label="Descripción" htmlFor="description">
          <Textarea
            id="description"
            name="description"
            rows={2}
            defaultValue={question?.description ?? ""}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Tipo" className="sm:col-span-1">
            <Select
              value={type}
              onValueChange={(value) => changeType(value as QuestionType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {QUESTION_TYPES.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Puntos" htmlFor="questionMark">
            <Input
              id="questionMark"
              name="questionMark"
              type="number"
              min="0"
              defaultValue={question?.mark ?? 1}
            />
          </Field>
          <Field label="Orden" htmlFor="questionOrder">
            <Input
              id="questionOrder"
              name="questionOrder"
              type="number"
              min="0"
              defaultValue={question?.order ?? nextOrder}
            />
          </Field>
        </div>

        <MediaField
          label="Imagen o video"
          name="media"
          folder="questions"
          accept="image/*,video/*"
          defaultValue={question?.media}
        />

        {canEditAnswers && (
          <Field
            label="Opciones"
            hint={
              singleAnswer
                ? "Solo una opción puede ser la correcta."
                : "Marca todas las opciones correctas."
            }
          >
            <div className="space-y-2">
              {answers.map((answer, index) => (
                <div key={index} className="flex items-center gap-2">
                  {singleAnswer ? (
                    <input
                      type="radio"
                      name="correctChoice"
                      className="size-4 accent-academy-green"
                      checked={answer.isCorrect}
                      onChange={() => setOnlyCorrect(index)}
                      aria-label={`Opción ${index + 1} es la correcta`}
                    />
                  ) : (
                    <Checkbox
                      checked={answer.isCorrect}
                      onCheckedChange={(checked) =>
                        setAnswerAt(index, { isCorrect: checked === true })
                      }
                      aria-label={`Opción ${index + 1} es correcta`}
                    />
                  )}
                  {answer.isCorrect && (
                    <input
                      type="hidden"
                      name="correctIndexes"
                      value={String(index)}
                    />
                  )}
                  <Input
                    name="answerTitle"
                    value={answer.title}
                    onChange={(event) =>
                      setAnswerAt(index, { title: event.target.value })
                    }
                    placeholder={`Opción ${index + 1}`}
                    readOnly={isTrueFalse}
                  />
                  {!isTrueFalse && (
                    <IconButton
                      destructive
                      aria-label={`Quitar opción ${index + 1}`}
                      onClick={() =>
                        setAnswers((current) =>
                          current.filter((_, position) => position !== index)
                        )
                      }
                    >
                      <IconX className="size-4" />
                    </IconButton>
                  )}
                </div>
              ))}
              {!isTrueFalse && (
                <BrandButton
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setAnswers((current) => [
                      ...current,
                      { title: "", isCorrect: false },
                    ])
                  }
                >
                  <IconPlus className="size-4" strokeWidth={2.5} />
                  Agregar opción
                </BrandButton>
              )}
            </div>
          </Field>
        )}

        {type === "ESSAY" && (
          <p className="rounded-card border-2 border-border-subtle bg-surface-muted p-3 text-sm text-content-muted">
            Las respuestas de ensayo se califican a mano; esta pregunta no lleva
            opciones.
          </p>
        )}

        {type === "SORTING" && (
          <Field
            label="Elementos a ordenar"
            htmlFor="sortableItems"
            hint="Uno por línea, en el orden correcto."
          >
            <Textarea
              id="sortableItems"
              name="sortableItems"
              rows={5}
              defaultValue={question?.settings?.sortableItems?.join("\n") ?? ""}
            />
          </Field>
        )}

        {type === "FILL_IN_THE_BLANKS" && (
          <Field
            label="Respuestas correctas"
            htmlFor="correctAnswers"
            hint="Una por línea, en el orden de los espacios."
          >
            <Textarea
              id="correctAnswers"
              name="correctAnswers"
              rows={5}
              defaultValue={question?.settings?.correctAnswers?.join("\n") ?? ""}
            />
          </Field>
        )}

        {type === "MATRIX_SORTING" && (
          <Field
            label="Relaciones"
            htmlFor="matrixMatches"
            hint="Una por línea con el formato: columna A | columna B"
          >
            <Textarea
              id="matrixMatches"
              name="matrixMatches"
              rows={5}
              defaultValue={
                question?.settings?.matrixMatches
                  ?.map((match) => `${match.columnA} | ${match.columnB}`)
                  .join("\n") ?? ""
              }
            />
          </Field>
        )}

        <Field label="Explicación de la respuesta" htmlFor="answerExplanation">
          <Textarea
            id="answerExplanation"
            name="answerExplanation"
            rows={3}
            defaultValue={question?.answerExplanation ?? ""}
          />
        </Field>

        <div className="space-y-2">
          <label className="flex items-center gap-2.5 text-sm">
            <Checkbox
              name="answerRequired"
              defaultChecked={question?.settings?.answerRequired ?? true}
            />
            Respuesta obligatoria
          </label>
          <label className="flex items-center gap-2.5 text-sm">
            <Checkbox
              name="showQuestionMark"
              defaultChecked={question?.settings?.showQuestionMark ?? true}
            />
            Mostrar el puntaje al alumno
          </label>
          <label className="flex items-center gap-2.5 text-sm">
            <Checkbox
              name="randomizeQuestion"
              defaultChecked={question?.settings?.randomizeQuestion ?? false}
            />
            Aleatorizar el orden de las opciones
          </label>
        </div>
      </fetcher.Form>
    </FormSheet>
  )
}
