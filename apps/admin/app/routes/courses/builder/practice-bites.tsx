import { useFetcherOutcome } from "@academy/admin-ui/hooks/use-fetcher-outcome"
import { getAdminPracticeBites } from "@academy/courses-api/graphql/admin-app/queries/curriculum"
import {
  createPracticeBite,
  createPracticeBiteItem,
  deletePracticeBite,
  deletePracticeBiteItem,
  updatePracticeBite,
  updatePracticeBiteItem,
} from "@academy/courses-api/graphql/admin-app/mutations/curriculum"
import { DeleteDialog } from "@academy/admin-ui/components/shared/delete-dialog"
import { EmptyState } from "@academy/admin-ui/components/shared/empty-state"
import { FormSheet } from "@academy/admin-ui/components/shared/form-sheet"
import { MediaField } from "@academy/admin-ui/components/shared/media-field"
import { PageBreadcrumbs } from "@academy/admin-ui/components/ui/breadcrumb"
import { Field } from "@academy/admin-ui/components/ui/field"
import { IconButton } from "@academy/admin-ui/components/ui/icon-button"
import { Input, Textarea } from "@academy/admin-ui/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@academy/admin-ui/components/ui/select"
import { BrandButton } from "@academy/user-ui/components/brand/brand-button"
import { Pill } from "@academy/user-ui/components/brand/primitives"
import { Checkbox } from "@academy/user-ui/components/ui/checkbox"
import { IconPencil, IconPlus, IconTrash } from "@tabler/icons-react"
import { useState } from "react"
import { useFetcher } from "react-router"
import type { Route } from "./+types/practice-bites"

export function meta() {
  return [{ title: "USPK Academy | Práctica" }]
}

const ITEM_TYPES = [
  { value: "TRUE_FALSE", label: "Verdadero o falso" },
  { value: "IMAGE_SHORT_PHRASE", label: "Imagen y frase corta" },
  { value: "FILL_IN_THE_BLANKS", label: "Completa los espacios" },
  { value: "MATCHING_4_COLUMN", label: "Relacionar columnas" },
] as const

type ItemType = (typeof ITEM_TYPES)[number]["value"]

/** Authors mark a gap by typing three or more underscores in the prompt. */
const BLANK_PATTERN = /_{3,}/g

export async function loader({ request, params }: Route.LoaderArgs) {
  const { practiceBitesByLessonId } = await getAdminPracticeBites(
    request,
    params.lessonId
  )
  return { bites: practiceBitesByLessonId }
}

function lines(form: FormData, key: string): string[] {
  return String(form.get(key) ?? "")
    .split("\n")
    .map((value) => value.trim())
    .filter(Boolean)
}

function optionalNumber(form: FormData, key: string): number | null {
  const raw = String(form.get(key) ?? "").trim()
  if (!raw) return null
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : null
}

/** Each item type stores its answer key in a different corner of the settings
 *  union, so only the relevant branch is populated. */
function itemSettings(form: FormData, type: ItemType) {
  return {
    correctBoolean:
      type === "TRUE_FALSE" ? form.get("correctBoolean") === "on" : null,
    acceptedAnswers:
      type === "IMAGE_SHORT_PHRASE" ? lines(form, "acceptedAnswers") : null,
    caseSensitive:
      type === "IMAGE_SHORT_PHRASE"
        ? form.get("caseSensitive") === "on"
        : null,
    blanks: type === "FILL_IN_THE_BLANKS" ? lines(form, "blanks") : null,
    options: type === "FILL_IN_THE_BLANKS" ? lines(form, "options") : null,
    matchingRows:
      type === "MATCHING_4_COLUMN"
        ? lines(form, "matchingRows").map((row) => ({
            columns: row.split("|").map((column) => column.trim()),
          }))
        : null,
  }
}

export async function action({ request, params }: Route.ActionArgs) {
  const form = await request.formData()
  const intent = String(form.get("intent") ?? "")
  const id = String(form.get("id") ?? "")

  switch (intent) {
    case "bite-create": {
      const { error } = await createPracticeBite(request, {
        input: {
          lessonId: params.lessonId,
          title: String(form.get("title") ?? "").trim(),
          description: String(form.get("description") ?? "").trim() || null,
          position: optionalNumber(form, "position"),
          solutionRevealThreshold: optionalNumber(
            form,
            "solutionRevealThreshold"
          ),
        },
      })
      return error ? { error: error.message } : { ok: true }
    }

    case "bite-update": {
      const { error } = await updatePracticeBite(request, {
        id,
        input: {
          title: String(form.get("title") ?? "").trim(),
          description: String(form.get("description") ?? "").trim() || null,
          position: optionalNumber(form, "position"),
          solutionRevealThreshold: optionalNumber(
            form,
            "solutionRevealThreshold"
          ),
        },
      })
      return error ? { error: error.message } : { ok: true }
    }

    case "bite-delete": {
      const { error } = await deletePracticeBite(request, { id })
      return error ? { error: error.message } : { ok: true }
    }

    case "item-create": {
      const type = String(form.get("type") ?? "TRUE_FALSE") as ItemType
      const { error } = await createPracticeBiteItem(request, {
        input: {
          practiceBiteId: String(form.get("practiceBiteId") ?? ""),
          type,
          prompt: String(form.get("prompt") ?? "").trim(),
          media: String(form.get("media") ?? "").trim() || null,
          answerExplanation:
            String(form.get("answerExplanation") ?? "").trim() || null,
          position: optionalNumber(form, "position"),
          settings: itemSettings(form, type),
        },
      })
      return error ? { error: error.message } : { ok: true }
    }

    case "item-update": {
      const type = String(form.get("type") ?? "TRUE_FALSE") as ItemType
      const { error } = await updatePracticeBiteItem(request, {
        id,
        input: {
          type,
          prompt: String(form.get("prompt") ?? "").trim(),
          media: String(form.get("media") ?? "").trim() || null,
          answerExplanation:
            String(form.get("answerExplanation") ?? "").trim() || null,
          position: optionalNumber(form, "position"),
          settings: itemSettings(form, type),
        },
      })
      return error ? { error: error.message } : { ok: true }
    }

    case "item-delete": {
      const { error } = await deletePracticeBiteItem(request, { id })
      return error ? { error: error.message } : { ok: true }
    }

    default:
      return { error: "Acción no reconocida." }
  }
}

type Bite = Route.ComponentProps["loaderData"]["bites"][number]
type Item = NonNullable<Bite["items"]>[number]

type Editing =
  | { kind: "bite"; bite: Bite | null }
  | { kind: "item"; biteId: string; item: Item | null; nextPosition: number }

type Deleting = { intent: string; id: string; type: string; name: string }

export default function PracticeBitesRoute({
  loaderData,
  params,
}: Route.ComponentProps) {
  const { bites } = loaderData
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
      {editing?.kind === "bite" && (
        <BiteSheet
          bite={editing.bite}
          nextPosition={bites.length + 1}
          submitting={submitting}
          fetcher={fetcher}
          onClose={() => setEditing(null)}
        />
      )}
      {editing?.kind === "item" && (
        <ItemSheet
          biteId={editing.biteId}
          item={editing.item}
          nextPosition={editing.nextPosition}
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

  const breadcrumbs = (
    <PageBreadcrumbs
      items={[
        { label: "Currículum", href: `/courses/${params.cid}/curriculum` },
        { label: "Práctica" },
      ]}
    />
  )

  return (
    <div className="space-y-4">
      {breadcrumbs}

      <div className="flex items-center justify-between">
        <h2 className="text-card-title leading-display font-bold tracking-tight-brand">
          Práctica
        </h2>
        <BrandButton
          variant="promo"
          onClick={() => setEditing({ kind: "bite", bite: null })}
        >
          <IconPlus className="size-4" strokeWidth={2.5} />
          Nuevo practice bite
        </BrandButton>
      </div>

      {bites.length === 0 && (
        <EmptyState
          title="Esta lección no tiene práctica"
          description="Los practice bites son ejercicios cortos que el alumno resuelve después de la lección."
          actionLabel="Nuevo practice bite"
          onAction={() => setEditing({ kind: "bite", bite: null })}
        />
      )}

      {bites.map((bite) => (
        <section
          key={bite.id}
          className="rounded-card border-2 border-border-strong bg-surface-card shadow-hard-xs"
        >
          <header className="flex items-start gap-2 p-card-sm">
            <div className="flex-1">
              <h3 className="font-bold">{bite.title}</h3>
              {bite.description && (
                <p className="text-sm text-content-muted">{bite.description}</p>
              )}
              <p className="mt-1 text-label text-content-muted">
                Solución tras {bite.solutionRevealThreshold} intento
                {bite.solutionRevealThreshold === 1 ? "" : "s"}
              </p>
            </div>
            <Pill tone="white">{bite.items?.length ?? 0} ejercicios</Pill>
            <IconButton
              aria-label="Editar practice bite"
              onClick={() => setEditing({ kind: "bite", bite })}
            >
              <IconPencil className="size-4" />
            </IconButton>
            <IconButton
              destructive
              aria-label="Eliminar practice bite"
              onClick={() =>
                setDeleting({
                  intent: "bite-delete",
                  id: bite.id,
                  type: "Practice bite",
                  name: bite.title,
                })
              }
            >
              <IconTrash className="size-4" />
            </IconButton>
          </header>

          <div className="space-y-1 border-t-2 border-border-subtle p-3">
            {bite.items?.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 rounded-button px-3 py-2 hover:bg-academy-yellow-soft"
              >
                <Pill tone="white" className="shrink-0">
                  {ITEM_TYPES.find((entry) => entry.value === item.type)
                    ?.label ?? item.type}
                </Pill>
                <span className="line-clamp-1 flex-1 text-sm">
                  {item.prompt}
                </span>
                <IconButton
                  aria-label="Editar ejercicio"
                  onClick={() =>
                    setEditing({
                      kind: "item",
                      biteId: bite.id,
                      item,
                      nextPosition: item.position,
                    })
                  }
                >
                  <IconPencil className="size-4" />
                </IconButton>
                <IconButton
                  destructive
                  aria-label="Eliminar ejercicio"
                  onClick={() =>
                    setDeleting({
                      intent: "item-delete",
                      id: item.id,
                      type: "Ejercicio",
                      name: item.prompt,
                    })
                  }
                >
                  <IconTrash className="size-4" />
                </IconButton>
              </div>
            ))}

            <BrandButton
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() =>
                setEditing({
                  kind: "item",
                  biteId: bite.id,
                  item: null,
                  nextPosition: bite.items?.length ?? 0,
                })
              }
            >
              <IconPlus className="size-4" strokeWidth={2.5} />
              Ejercicio
            </BrandButton>
          </div>
        </section>
      ))}

      {dialogs}
    </div>
  )
}

type FetcherLike = ReturnType<typeof useFetcher<{ error?: string; ok?: boolean }>>

function BiteSheet({
  bite,
  nextPosition,
  submitting,
  fetcher,
  onClose,
}: {
  bite: Bite | null
  nextPosition: number
  submitting: boolean
  fetcher: FetcherLike
  onClose: () => void
}) {
  return (
    <FormSheet
      open
      onOpenChange={(open) => !open && onClose()}
      title={bite ? "Editar practice bite" : "Nuevo practice bite"}
      description="Un grupo de ejercicios cortos que refuerzan la lección."
      formId="bite-form"
      submitLabel={bite ? "Guardar cambios" : "Crear"}
      submitting={submitting}
    >
      <fetcher.Form method="post" id="bite-form" className="space-y-4 pt-4">
        <input
          type="hidden"
          name="intent"
          value={bite ? "bite-update" : "bite-create"}
        />
        {bite && <input type="hidden" name="id" value={bite.id} />}

        <Field label="Título" htmlFor="title" required>
          <Input id="title" name="title" defaultValue={bite?.title ?? ""} required />
        </Field>

        <Field label="Descripción" htmlFor="description">
          <Textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={bite?.description ?? ""}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Intentos antes de revelar"
            htmlFor="solutionRevealThreshold"
            hint="Tras cuántos fallos se muestra la solución."
          >
            <Input
              id="solutionRevealThreshold"
              name="solutionRevealThreshold"
              type="number"
              min="1"
              defaultValue={bite?.solutionRevealThreshold ?? 2}
            />
          </Field>
          <Field label="Posición" htmlFor="position">
            <Input
              id="position"
              name="position"
              type="number"
              min="0"
              defaultValue={bite?.position ?? nextPosition}
            />
          </Field>
        </div>
      </fetcher.Form>
    </FormSheet>
  )
}

function ItemSheet({
  biteId,
  item,
  nextPosition,
  submitting,
  fetcher,
  onClose,
}: {
  biteId: string
  item: Item | null
  nextPosition: number
  submitting: boolean
  fetcher: FetcherLike
  onClose: () => void
}) {
  const [type, setType] = useState<ItemType>(
    (item?.type as ItemType) ?? "TRUE_FALSE"
  )
  const [prompt, setPrompt] = useState(item?.prompt ?? "")

  const blankCount = (prompt.match(BLANK_PATTERN) ?? []).length

  return (
    <FormSheet
      open
      onOpenChange={(open) => !open && onClose()}
      title={item ? "Editar ejercicio" : "Nuevo ejercicio"}
      formId="item-form"
      submitLabel={item ? "Guardar cambios" : "Crear ejercicio"}
      submitting={submitting}
      className="sm:max-w-xl"
    >
      <fetcher.Form method="post" id="item-form" className="space-y-4 pt-4">
        <input
          type="hidden"
          name="intent"
          value={item ? "item-update" : "item-create"}
        />
        <input type="hidden" name="practiceBiteId" value={biteId} />
        {item && <input type="hidden" name="id" value={item.id} />}
        <input type="hidden" name="type" value={type} />

        <Field label="Tipo">
          <Select
            value={type}
            onValueChange={(value) => setType(value as ItemType)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ITEM_TYPES.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field
          label="Enunciado"
          htmlFor="prompt"
          required
          hint={
            type === "FILL_IN_THE_BLANKS"
              ? `Escribe ___ donde va cada hueco. Detectados: ${blankCount}.`
              : undefined
          }
        >
          <Textarea
            id="prompt"
            name="prompt"
            rows={3}
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            required
          />
        </Field>

        {type === "TRUE_FALSE" && (
          <label className="flex items-center gap-2.5 text-sm">
            <Checkbox
              name="correctBoolean"
              defaultChecked={item?.settings?.correctBoolean ?? false}
            />
            La afirmación es verdadera
          </label>
        )}

        {type === "IMAGE_SHORT_PHRASE" && (
          <>
            <MediaField
              label="Imagen"
              name="media"
              folder="practice-bites"
              defaultValue={item?.media}
            />
            <Field
              label="Respuestas aceptadas"
              htmlFor="acceptedAnswers"
              hint="Una por línea; cualquiera se da por buena."
              required
            >
              <Textarea
                id="acceptedAnswers"
                name="acceptedAnswers"
                rows={4}
                defaultValue={item?.settings?.acceptedAnswers?.join("\n") ?? ""}
              />
            </Field>
            <label className="flex items-center gap-2.5 text-sm">
              <Checkbox
                name="caseSensitive"
                defaultChecked={item?.settings?.caseSensitive ?? false}
              />
              Distinguir mayúsculas y minúsculas
            </label>
          </>
        )}

        {type === "FILL_IN_THE_BLANKS" && (
          <>
            <Field
              label="Respuestas de los huecos"
              htmlFor="blanks"
              hint="Una por línea, en el orden en que aparecen los ___."
              required
              error={
                blankCount === 0
                  ? "El enunciado todavía no tiene ningún ___."
                  : null
              }
            >
              <Textarea
                id="blanks"
                name="blanks"
                rows={4}
                defaultValue={item?.settings?.blanks?.join("\n") ?? ""}
              />
            </Field>
            <Field
              label="Opciones a mostrar"
              htmlFor="options"
              hint="Opcional. Una por línea — incluye distractores."
            >
              <Textarea
                id="options"
                name="options"
                rows={4}
                defaultValue={item?.settings?.options?.join("\n") ?? ""}
              />
            </Field>
          </>
        )}

        {type === "MATCHING_4_COLUMN" && (
          <Field
            label="Filas"
            htmlFor="matchingRows"
            hint="Una fila por línea, columnas separadas por |  —  ej. célula | núcleo | ADN | gen"
            required
          >
            <Textarea
              id="matchingRows"
              name="matchingRows"
              rows={5}
              defaultValue={
                item?.settings?.matchingRows
                  ?.map((row) => row.columns.join(" | "))
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
            defaultValue={item?.answerExplanation ?? ""}
          />
        </Field>

        <Field label="Posición" htmlFor="position">
          <Input
            id="position"
            name="position"
            type="number"
            min="0"
            defaultValue={item?.position ?? nextPosition}
          />
        </Field>
      </fetcher.Form>
    </FormSheet>
  )
}
