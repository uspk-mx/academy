import { cn } from "@academy/user-ui/lib/utils"
import {
  IconCamera,
  IconCheck,
  IconMoodSmile,
  IconPencil,
  IconPlus,
  IconX,
} from "@tabler/icons-react"
import { useState } from "react"
import { Form } from "react-router"
import type {
  ProfileActionData,
  ProfileErrorLabels,
  ProfileField,
  ProfilePageLabels,
  StudentProfile,
} from "../../types/profile"

export interface StudentProfilePageProps {
  profile: StudentProfile
  labels: ProfilePageLabels
  result?: ProfileActionData
  isSaving?: boolean
}

function errorText(
  code: string | undefined,
  errors: ProfileErrorLabels
): string | undefined {
  if (!code) return undefined
  return errors[code as keyof ProfileErrorLabels] ?? code
}

const dateFormatter = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "full",
  timeStyle: "short",
  timeZone: "America/Mexico_City",
})

function formatDate(value: string | null): string | null {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : dateFormatter.format(date)
}

/**
 * Profile view + edit in one form. Everything posts to the route action as
 * multipart (the avatar rides along), so a save is a single atomic submit
 * rather than an upload followed by a mutation.
 */
export function StudentProfilePage({
  profile,
  labels,
  result,
  isSaving,
}: StudentProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false)
  // Draft state only — the server copy stays authoritative until a save lands.
  const [interests, setInterests] = useState(profile.interests)
  const [newInterest, setNewInterest] = useState("")
  const [preview, setPreview] = useState<string | null>(null)
  /**
   * `result` outlives the save it belongs to, so the banner needs to be
   * dismissable: entering edit mode hides it, and starting a new save clears
   * the dismissal so the next result is announced.
   */
  const [dismissedNotice, setDismissedNotice] = useState(false)

  const startEditing = () => {
    setDismissedNotice(true)
    setIsEditing(true)
  }

  const stopEditing = () => {
    setIsEditing(false)
    setInterests(profile.interests)
    setNewInterest("")
    setPreview(null)
  }

  const addInterest = () => {
    const value = newInterest.trim()
    if (!value || interests.includes(value)) {
      setNewInterest("")
      return
    }
    setInterests((current) => [...current, value])
    setNewInterest("")
  }

  const onPickImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return setPreview(null)
    const reader = new FileReader()
    reader.onloadend = () => setPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const avatarSrc = preview ?? profile.profilePicture
  const registeredAt = formatDate(profile.createdAt)
  const updatedAt = formatDate(profile.updatedAt)

  return (
    <Form
      // Remounting on a mode flip re-seeds the inputs from the loader data, so
      // a cancelled edit can't leave typed values behind in the read-only view.
      key={isEditing ? "edit" : "view"}
      method="post"
      encType="multipart/form-data"
      onSubmit={() => setDismissedNotice(false)}
      className="flex flex-col gap-stack-lg"
    >
      {/* Navigation lives in the sidebar, so this row is actions only. */}
      <div className="flex flex-wrap items-center justify-end gap-stack">
        <div className="flex items-center gap-2">
          {isEditing && (
            <button
              type="button"
              onClick={stopEditing}
              className="inline-flex items-center gap-2 rounded-button border-2 border-border-strong bg-surface-card px-4 py-2 font-bold shadow-hard-xs"
            >
              {labels.cancelCta}
            </button>
          )}
          {isEditing ? (
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-button border-2 border-border-strong bg-academy-green px-4 py-2 font-bold text-content-inverse shadow-hard-xs transition-all duration-150 ease-academy hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-sm disabled:pointer-events-none disabled:opacity-60"
            >
              <IconCheck aria-hidden className="size-4" />
              {isSaving ? labels.savingCta : labels.saveCta}
            </button>
          ) : (
            <button
              type="button"
              onClick={startEditing}
              className="inline-flex items-center gap-2 rounded-button border-2 border-border-strong bg-academy-yellow px-4 py-2 font-bold shadow-hard-xs transition-all duration-150 ease-academy hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-sm"
            >
              <IconPencil aria-hidden className="size-4" />
              {labels.editCta}
            </button>
          )}
        </div>
      </div>

      {result?.ok && !dismissedNotice && (
        <p
          role="status"
          className="rounded-card border-2 border-border-strong bg-academy-green-soft p-3 text-sm font-bold"
        >
          {labels.savedNotice}
        </p>
      )}
      {result?.formError && (
        <p
          role="alert"
          className="rounded-card border-2 border-border-strong bg-academy-coral-soft p-3 text-sm font-bold"
        >
          {errorText(result.formError, labels.errors)}
        </p>
      )}

      <div className="grid gap-stack-lg md:grid-cols-[1fr_2fr]">
        <div className="flex flex-col gap-stack-lg">
          <section className="rounded-card border-2 border-border-strong bg-surface-card p-card shadow-hard-lg">
            <div className="relative mx-auto aspect-square w-full max-w-56 overflow-hidden rounded-card border-2 border-border-strong bg-surface-muted">
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt={labels.avatarAria}
                  className="size-full object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center">
                  <IconMoodSmile aria-hidden className="size-2/3 text-academy-yellow" />
                </div>
              )}

              {isEditing && (
                <>
                  <label
                    htmlFor="avatar"
                    className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center gap-2 bg-academy-ink/60 text-content-inverse"
                  >
                    <IconCamera aria-hidden className="size-8" />
                    <span className="text-sm font-bold">
                      {labels.changePhotoCta}
                    </span>
                  </label>
                  <input
                    id="avatar"
                    name="avatar"
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={onPickImage}
                    className="sr-only"
                  />
                </>
              )}
            </div>
            {result?.fieldErrors?.avatar && (
              <p className="mt-2 text-center text-label font-bold text-academy-coral">
                {errorText(result.fieldErrors.avatar, labels.errors)}
              </p>
            )}

            <div className="mt-stack text-center">
              <h2 className="text-card-title font-bold tracking-tight-brand">
                {profile.fullName}
              </h2>
              <p className="text-sm font-bold text-content-muted">
                @{profile.userName}
              </p>
              <span
                className={cn(
                  "mt-2 inline-flex items-center gap-2 rounded-pill border-2 border-border-strong px-3 py-1 text-sm font-bold",
                  profile.isActive ? "bg-academy-green" : "bg-surface-muted"
                )}
              >
                <span
                  aria-hidden
                  className="size-2 rounded-pill bg-academy-ink"
                />
                {profile.isActive ? labels.activeLabel : labels.inactiveLabel}
              </span>
            </div>
          </section>

          <section className="rounded-card border-2 border-border-strong bg-surface-card p-card shadow-hard-lg">
            <h3 className="font-bold tracking-tight-brand uppercase">
              {labels.accountSectionTitle}
            </h3>
            <dl className="mt-stack flex flex-col gap-stack">
              <div>
                <dt className="text-label font-bold text-content-muted uppercase">
                  {labels.registeredAtLabel}
                </dt>
                <dd className="font-bold">{registeredAt ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-label font-bold text-content-muted uppercase">
                  {labels.updatedAtLabel}
                </dt>
                <dd className="font-bold">
                  {updatedAt ?? labels.neverUpdated}
                </dd>
              </div>
            </dl>
          </section>
        </div>

        <section className="rounded-card border-2 border-border-strong bg-surface-card p-card shadow-hard-lg">
          <h1 className="text-section-title leading-display font-bold tracking-display">
            {labels.pageTitle}
          </h1>

          <div className="mt-stack-lg flex flex-col gap-stack-lg">
            <fieldset className="border-0 p-0">
              <SectionHeading accent="border-academy-coral">
                {labels.personalSectionTitle}
              </SectionHeading>
              <div className="grid gap-stack md:grid-cols-2">
                <Field
                  name="fullName"
                  label={labels.fullNameLabel}
                  defaultValue={profile.fullName}
                  disabled={!isEditing}
                  error={errorText(result?.fieldErrors?.fullName, labels.errors)}
                />
                <Field
                  name="userName"
                  label={labels.userNameLabel}
                  defaultValue={profile.userName}
                  disabled={!isEditing}
                  error={errorText(result?.fieldErrors?.userName, labels.errors)}
                />
                <Field
                  name="email"
                  type="email"
                  label={labels.emailLabel}
                  defaultValue={profile.email}
                  disabled={!isEditing}
                  error={errorText(result?.fieldErrors?.email, labels.errors)}
                />
              </div>
            </fieldset>

            <fieldset className="border-0 p-0">
              <SectionHeading accent="border-academy-yellow">
                {labels.professionalSectionTitle}
              </SectionHeading>
              <div className="grid gap-stack md:grid-cols-2">
                <Field
                  name="occupation"
                  label={labels.occupationLabel}
                  defaultValue={profile.occupation}
                  disabled={!isEditing}
                  error={errorText(
                    result?.fieldErrors?.occupation,
                    labels.errors
                  )}
                />
                <Field
                  name="major"
                  label={labels.majorLabel}
                  defaultValue={profile.major}
                  disabled={!isEditing}
                  error={errorText(result?.fieldErrors?.major, labels.errors)}
                />
                <Field
                  name="phoneNumber"
                  type="tel"
                  label={labels.phoneLabel}
                  defaultValue={profile.phoneNumber}
                  disabled={!isEditing}
                  error={errorText(
                    result?.fieldErrors?.phoneNumber,
                    labels.errors
                  )}
                />
              </div>
            </fieldset>

            <fieldset className="border-0 p-0">
              <SectionHeading accent="border-academy-green">
                {labels.interestsSectionTitle}
              </SectionHeading>

              {/* Chips are draft state; these carry them to the action. */}
              {interests.map((interest) => (
                <input
                  key={interest}
                  type="hidden"
                  name="interests"
                  value={interest}
                />
              ))}

              <div className="flex flex-wrap gap-2">
                {interests.length === 0 && (
                  <p className="text-sm text-content-muted">
                    {labels.noInterests}
                  </p>
                )}
                {interests.map((interest) => (
                  <span
                    key={interest}
                    className="inline-flex items-center gap-2 rounded-pill border-2 border-border-strong bg-academy-yellow px-3 py-1 text-sm font-bold"
                  >
                    {interest}
                    {isEditing && (
                      <button
                        type="button"
                        aria-label={`${labels.removeInterestAria}: ${interest}`}
                        onClick={() =>
                          setInterests((current) =>
                            current.filter((value) => value !== interest)
                          )
                        }
                        className="rounded-pill p-0.5 hover:bg-academy-ink/10"
                      >
                        <IconX aria-hidden className="size-3.5" />
                      </button>
                    )}
                  </span>
                ))}
              </div>

              {isEditing && (
                <div className="mt-stack flex gap-2">
                  <input
                    type="text"
                    value={newInterest}
                    onChange={(event) => setNewInterest(event.target.value)}
                    onKeyDown={(event) => {
                      // Enter adds a chip instead of submitting the whole form.
                      if (event.key === "Enter") {
                        event.preventDefault()
                        addInterest()
                      }
                    }}
                    placeholder={labels.newInterestPlaceholder}
                    className="min-w-0 flex-1 rounded-button border-2 border-border-strong bg-surface-card px-4 py-2 font-bold placeholder:text-content-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-academy-blue"
                  />
                  <button
                    type="button"
                    onClick={addInterest}
                    className="inline-flex shrink-0 items-center gap-2 rounded-button border-2 border-border-strong bg-academy-yellow px-4 py-2 font-bold shadow-hard-xs"
                  >
                    <IconPlus aria-hidden className="size-4" />
                    {labels.addInterestCta}
                  </button>
                </div>
              )}
            </fieldset>
          </div>
        </section>
      </div>
    </Form>
  )
}

function SectionHeading({
  accent,
  children,
}: {
  accent: string
  children: React.ReactNode
}) {
  return (
    <h2
      className={cn(
        "mb-stack inline-block border-b-4 pb-1 text-card-title font-bold tracking-tight-brand",
        accent
      )}
    >
      {children}
    </h2>
  )
}

function Field({
  name,
  label,
  defaultValue,
  disabled,
  error,
  type = "text",
}: {
  name: ProfileField
  label: string
  defaultValue: string
  disabled?: boolean
  error?: string
  type?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="font-bold">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        className={cn(
          "rounded-button border-2 border-border-strong bg-surface-card px-4 py-2 font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-academy-blue",
          disabled && "bg-surface-page opacity-100",
          error && "border-academy-coral"
        )}
      />
      {error && (
        <p className="text-label font-bold text-academy-coral">{error}</p>
      )}
    </div>
  )
}
