import { getToken } from "@academy/courses-api/utils"
import {
  getPreferredLang,
  isSupportedLang,
  logicalPathname,
} from "@academy/user-ui/lib/lang"
import { loginUrlFor } from "@academy/user-ui/lib/site-urls"
import { redirect } from "react-router"

/**
 * Gate for authenticated routes. Sends anonymous visitors to login with the
 * locale preserved and a `redirect` back to where they were headed — which is
 * cross-origin for the student app (see lib/site-urls).
 *
 * `logicalPathname` matters here: React Router fetches "<path>.data" for client
 * navigations, so without stripping that suffix the visitor would be bounced
 * back to an internal data URL after logging in.
 */
export async function authMiddleware({ request }: any, next: any) {
  const token = await getToken(request)

  if (!token) {
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
