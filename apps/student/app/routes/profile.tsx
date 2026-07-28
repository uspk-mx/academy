import { updateUserProfile } from "@academy/courses-api/graphql/student-app/mutations/users"
import { getUserProfile } from "@academy/courses-api/graphql/student-app/queries/users"
import { StudentProfilePage } from "@academy/student-ui/components/pages/profile-page"
import {
  profilePageLabels,
  type ProfileActionData,
  type StudentProfile,
} from "@academy/student-ui/types/profile"
import { authMiddleware } from "@academy/user-ui/middleware/auth"
import { pickLocale } from "@academy/user-ui/lib/lang"
import { data, useNavigation } from "react-router"
import { uploadFile } from "~/../lib/upload"
import type { Route } from "./+types/profile"

export const middleware: Route.MiddlewareFunction[] = [authMiddleware]

export function meta() {
  return [
    { title: "Uspk Academy | Perfil" },
    {
      name: "description",
      content:
        "Perfil de usuario de Uspk Academy, visualiza y actualiza tu información personal.",
    },
  ]
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const result = await getUserProfile(request)
  const me = result?.getProfile

  if (!me) throw new Response("Not Found", { status: 404 })

  const profile: StudentProfile = {
    fullName: me.fullName ?? "",
    userName: me.userName ?? "",
    email: me.email ?? "",
    phoneNumber: me.phoneNumber ?? "",
    major: me.major ?? "",
    occupation: me.occupation ?? "",
    interests: (me.interests ?? []).flatMap((i) => (i ? [i] : [])),
    profilePicture: me.profilePicture ?? null,
    isActive: me.isActive ?? false,
    createdAt: me.createdAt ?? "",
    updatedAt: me.updatedAt ?? null,
  }

  return { profile, labels: pickLocale(params.lang, profilePageLabels) }
}

const MAX_AVATAR_BYTES = 5 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
]

/**
 * One atomic save: validate → upload the avatar (if one was picked) → mutate.
 * Uploading here rather than from the browser means the profile can never be
 * written with a broken/missing image URL when the upload fails, and keeps the
 * API host and session off the client.
 *
 * Errors are returned as CODES; the page maps them to labels.
 */
export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData()

  const text = (key: string) => String(form.get(key) ?? "").trim()
  const fullName = text("fullName")
  const userName = text("userName")
  const email = text("email")

  const fieldErrors: ProfileActionData["fieldErrors"] = {}
  if (!fullName) fieldErrors.fullName = "required"
  if (!userName) fieldErrors.userName = "required"
  if (!email) fieldErrors.email = "required"
  else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    fieldErrors.email = "invalidEmail"

  const avatar = form.get("avatar")
  const hasAvatar = avatar instanceof File && avatar.size > 0
  if (hasAvatar) {
    if (avatar.size > MAX_AVATAR_BYTES) fieldErrors.avatar = "imageTooLarge"
    else if (!ALLOWED_IMAGE_TYPES.includes(avatar.type))
      fieldErrors.avatar = "imageType"
  }

  if (Object.keys(fieldErrors).length > 0) {
    return data<ProfileActionData>({ fieldErrors }, { status: 400 })
  }

  let profilePicture: string | undefined
  if (hasAvatar) {
    const uploaded = await uploadFile(request, avatar as File)
    if (!uploaded) {
      return data<ProfileActionData>(
        { fieldErrors: { avatar: "uploadFailed" } },
        { status: 502 }
      )
    }
    profilePicture = uploaded
  }

  try {
    const { setCookies } = await updateUserProfile({
      request,
      variables: {
        input: {
          fullName,
          userName,
          email,
          phoneNumber: text("phoneNumber"),
          major: text("major"),
          occupation: text("occupation"),
          interests: form.getAll("interests").map(String),
          // Omitted when untouched so the existing picture is preserved.
          ...(profilePicture ? { profilePicture } : {}),
        },
      },
    })

    const headers = new Headers()
    for (const cookie of setCookies) headers.append("Set-Cookie", cookie)
    return data<ProfileActionData>({ ok: true }, { headers })
  } catch (error) {
    console.error("[profile] update failed:", error)
    return data<ProfileActionData>({ formError: "generic" }, { status: 500 })
  }
}

export default function Profile({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { profile, labels } = loaderData
  const navigation = useNavigation()

  return (
    <StudentProfilePage
      profile={profile}
      labels={labels}
      result={actionData ?? undefined}
      isSaving={navigation.state === "submitting"}
    />
  )
}
