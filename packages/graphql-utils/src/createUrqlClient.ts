import { Client, cacheExchange, fetchExchange, ClientOptions } from "urql"

export function createBaseUrqlClient(options: {
  url: string
  headers?: HeadersInit
  preferGetMethod?: boolean
  onSetCookie?: (cookies: string[]) => void
}) {
  return new Client({
    url: options.url,
    exchanges: [cacheExchange, fetchExchange],
    preferGetMethod: options.preferGetMethod,
    fetchOptions: {
      method: "POST",
      headers: options.headers,
    },
    fetch: async (input, init) => {
      const response = await fetch(input, init)
      const setCookies = response.headers.getSetCookie()
      if (options.onSetCookie && setCookies.length > 0)
        options.onSetCookie(setCookies)
      return response
    },
  })
}
