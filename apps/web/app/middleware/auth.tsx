import { redirect } from "react-router"
import { getToken } from "@academy/courses-api/utils"

export async function authMiddleware({ request }: any, next: any) {
  const token = await getToken(request)
  if (!token) {
    throw redirect("/login")
  }
  let response = await next()
  return response
}
