import { getMe } from "@academy/courses-api/graphql/queries/me"
import { safeReturnTo } from "@academy/user-ui/lib/site-urls"
import { redirect } from "react-router"
import { isSupportedLang } from "../../lib/lang"

export function postAuthTarget(request: Request, lang: string): string {
  const target = safeReturnTo(
    new URL(request.url).searchParams.get("redirect"),
    `/${lang}`
  )
  if (/^https?:\/\//i.test(target)) return target
  const first = target.split("/").filter(Boolean)[0]
  return isSupportedLang(first) ? target : `/${lang}${target}`
}

export async function redirectIfAuthenticated(
  request: Request,
  lang: string
): Promise<void> {
  if ((await getMe(request))?.me) throw redirect(postAuthTarget(request, lang))
}
