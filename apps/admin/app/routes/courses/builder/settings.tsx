import { getAdminCourse } from "@academy/courses-api/graphql/admin-app/queries/courses"
import {
  getAdminCategories,
  getAdminLevels,
} from "@academy/courses-api/graphql/admin-app/queries/taxonomy"
import { updateCourse } from "@academy/courses-api/graphql/admin-app/mutations/courses"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@academy/admin-ui/components/ui/card"
import { MediaField } from "@academy/admin-ui/components/shared/media-field"
import { Field } from "@academy/admin-ui/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@academy/admin-ui/components/ui/select"
import { BrandButton } from "@academy/user-ui/components/brand/brand-button"
import { Input } from "@academy/admin-ui/components/ui/input"
import { Textarea } from "@academy/admin-ui/components/ui/input"
import { useEffect } from "react"
import { Form, useNavigation, useActionData } from "react-router"
import { toast } from "sonner"
import type { Route } from "./+types/settings"

export function meta() {
  return [{ title: "USPK Academy | Ajustes del curso" }]
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const [course, levels, categories] = await Promise.all([
    getAdminCourse(request, params.cid),
    getAdminLevels(request),
    getAdminCategories(request),
  ])

  return {
    course: course.course,
    levels: levels.getLevels,
    categories: categories.getCategories,
  }
}

/** `null` for empty optional fields — "" would clear a column to an empty
 *  string where the API expects "unset". */
function optional(form: FormData, key: string): string | null {
  const value = String(form.get(key) ?? "").trim()
  return value || null
}

function optionalNumber(form: FormData, key: string): number | null {
  const value = String(form.get(key) ?? "").trim()
  if (!value) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

export async function action({ request, params }: Route.ActionArgs) {
  const form = await request.formData()
  const title = String(form.get("title") ?? "").trim()

  if (!title) return { error: "El título es obligatorio." }

  const videoURL = optional(form, "videoURL")

  const { error } = await updateCourse(request, {
    id: params.cid,
    input: {
      title,
      shortDescription: optional(form, "shortDescription"),
      description: optional(form, "description"),
      featuredImage: optional(form, "featuredImage"),
      // Tags are entered comma-separated; the column stores a string list.
      tags: String(form.get("tags") ?? "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      price: optionalNumber(form, "price"),
      discountedPrice: optionalNumber(form, "discountedPrice"),
      promotionDuration: optionalNumber(form, "promotionDuration"),
      levelId: optional(form, "levelId"),
      categoryId: optional(form, "categoryId"),
      duration: optionalNumber(form, "duration"),
      maxEnrollments: optionalNumber(form, "maxEnrollments"),
      pricingType: (optional(form, "pricingType") ??
        null) as "FREE" | "PAID" | "CUSTOM" | null,
      visibility: (optional(form, "visibility") ??
        null) as "PUBLIC" | "PASSWORD_PROTECTED" | "PRIVATE" | null,
      video: videoURL ? { videoURL, source: optional(form, "videoSource") } : null,
    },
  })

  return error ? { error: error.message } : { ok: true }
}

export default function CourseSettingsRoute({
  loaderData,
}: Route.ComponentProps) {
  const { course, levels, categories } = loaderData
  const actionData = useActionData<{ error?: string; ok?: boolean }>()
  const navigation = useNavigation()
  const submitting = navigation.state === "submitting"

  useEffect(() => {
    if (!actionData) return
    if (actionData.error) toast.error(actionData.error)
    else if (actionData.ok) toast.success("Curso actualizado")
  }, [actionData])

  return (
    <Form method="post" className="space-y-6" noValidate>
      <Card>
        <CardHeader>
          <CardTitle>Información general</CardTitle>
          <CardDescription>
            Lo que el alumno ve en el catálogo y en la página del curso.
          </CardDescription>
        </CardHeader>

        <div className="space-y-4">
          <Field label="Título" htmlFor="title" required>
            <Input id="title" name="title" defaultValue={course.title} required />
          </Field>

          <Field
            label="Descripción corta"
            htmlFor="shortDescription"
            hint="Aparece en las tarjetas del catálogo."
          >
            <Textarea
              id="shortDescription"
              name="shortDescription"
              rows={2}
              defaultValue={course.shortDescription ?? ""}
            />
          </Field>

          <Field label="Descripción" htmlFor="description">
            <Textarea
              id="description"
              name="description"
              rows={6}
              defaultValue={course.description ?? ""}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <MediaField
              label="Imagen destacada"
              name="featuredImage"
              folder="courses"
              defaultValue={course.featuredImage}
            />
            <Field
              label="Etiquetas"
              htmlFor="tags"
              hint="Separadas por comas."
            >
              <Input
                id="tags"
                name="tags"
                defaultValue={course.tags?.join(", ") ?? ""}
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <MediaField
              label="Video de presentación"
              name="videoURL"
              folder="courses/video"
              accept="video/*"
              preview={false}
              defaultValue={course.video?.videoURL}
              hint="Se muestra como preview público."
            />
            <Field label="Fuente del video" htmlFor="videoSource">
              <Input
                id="videoSource"
                name="videoSource"
                defaultValue={course.video?.source ?? ""}
                placeholder="youtube, vimeo, cloudinary..."
              />
            </Field>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Clasificación</CardTitle>
          <CardDescription>
            Determina dónde aparece el curso y qué membresías lo incluyen.
          </CardDescription>
        </CardHeader>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Categoría" htmlFor="categoryId">
            <Select name="categoryId" defaultValue={course.category?.id ?? ""}>
              <SelectTrigger id="categoryId">
                <SelectValue placeholder="Sin categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Nivel" htmlFor="levelId">
            <Select name="levelId" defaultValue={course.level?.id ?? ""}>
              <SelectTrigger id="levelId">
                <SelectValue placeholder="Sin nivel" />
              </SelectTrigger>
              <SelectContent>
                {levels.map((level) => (
                  <SelectItem key={level.id} value={level.id}>
                    {level.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field
            label="Duración (min)"
            htmlFor="duration"
            hint="Total estimado."
          >
            <Input
              id="duration"
              name="duration"
              type="number"
              min="0"
              defaultValue={course.duration ?? ""}
            />
          </Field>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Precio y acceso</CardTitle>
          <CardDescription>
            Los cursos gratuitos ignoran el precio; los de pago requieren compra
            o una membresía activa.
          </CardDescription>
        </CardHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tipo de precio" htmlFor="pricingType">
            <Select name="pricingType" defaultValue={course.pricingType ?? ""}>
              <SelectTrigger id="pricingType">
                <SelectValue placeholder="Sin definir" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FREE">Gratis</SelectItem>
                <SelectItem value="PAID">De pago</SelectItem>
                <SelectItem value="CUSTOM">Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field label="Visibilidad" htmlFor="visibility">
            <Select name="visibility" defaultValue={course.visibility ?? ""}>
              <SelectTrigger id="visibility">
                <SelectValue placeholder="Sin definir" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PUBLIC">Público</SelectItem>
                <SelectItem value="PRIVATE">Privado</SelectItem>
                <SelectItem value="PASSWORD_PROTECTED">Con contraseña</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field label="Precio (MXN)" htmlFor="price">
            <Input
              id="price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              defaultValue={course.price ?? ""}
            />
          </Field>

          <Field label="Precio con descuento" htmlFor="discountedPrice">
            <Input
              id="discountedPrice"
              name="discountedPrice"
              type="number"
              min="0"
              step="0.01"
              defaultValue={course.discountedPrice ?? ""}
            />
          </Field>

          <Field
            label="Duración de la promoción (días)"
            htmlFor="promotionDuration"
          >
            <Input
              id="promotionDuration"
              name="promotionDuration"
              type="number"
              min="0"
              defaultValue={course.promotionDuration ?? ""}
            />
          </Field>

          <Field
            label="Cupo máximo"
            htmlFor="maxEnrollments"
            hint="Vacío significa sin límite."
          >
            <Input
              id="maxEnrollments"
              name="maxEnrollments"
              type="number"
              min="0"
              defaultValue={course.maxEnrollments ?? ""}
            />
          </Field>
        </div>
      </Card>

      <div className="flex justify-end">
        <BrandButton type="submit" disabled={submitting}>
          {submitting ? "Guardando..." : "Guardar cambios"}
        </BrandButton>
      </div>
    </Form>
  )
}
