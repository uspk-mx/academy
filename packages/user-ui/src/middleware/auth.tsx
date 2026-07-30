import { getMe } from "@academy/courses-api/graphql/queries/me"
import {
  getPreferredLang,
  isSupportedLang,
  logicalPathname,
} from "@academy/user-ui/lib/lang"
import { loginUrlFor } from "@academy/user-ui/lib/site-urls"
import { redirect } from "react-router"

/**
 * Gate for authenticated routes. Anyone without a valid session is sent to
 * login with the locale preserved and a `redirect` back to where they were
 * headed — cross-origin for the student app (see lib/site-urls).
 *
 * `logicalPathname` matters here: React Router fetches "<path>.data" for client
 * navigations, so without stripping that suffix the visitor would be bounced
 * back to an internal data URL after logging in.
 */
export async function authMiddleware({ request }: any, next: any) {
  const me = await getMe(request)

  if (!me?.me) {
    const url = new URL(request.url)
    const pathname = logicalPathname(url)
    const firstSegment = pathname.split("/").filter(Boolean)[0]
    const lang = isSupportedLang(firstSegment)
      ? firstSegment
      : getPreferredLang(request)

    throw redirect(
      loginUrlFor({ request, lang, returnTo: `${pathname}${url.search}` })
    )
  }

  return next()
}
