export async function getToken(request: Request) {
  const cookieHeader = request.headers.get("Cookie")
  const cookies = Object.fromEntries(
    cookieHeader?.split("; ").map((cookie) => {
      const eq = cookie.indexOf("=")
      return [cookie.slice(0, eq), cookie.slice(eq + 1)]
    }) || []
  )

  return cookies.session_token as string | undefined
}

export async function getCookie(request: Request, cookieName: string) {
  const cookieHeader = request.headers.get("Cookie")
  const cookies = Object.fromEntries(
    cookieHeader?.split("; ").map((cookie) => {
      const eq = cookie.indexOf("=")
      return [cookie.slice(0, eq), cookie.slice(eq + 1)]
    }) || []
  )

  return cookies[cookieName] as string | undefined
}
