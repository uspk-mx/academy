import { runQuery } from "@academy/courses-api/api-client"
import { graphql, ResultOf } from "../../graphql"

export const VALIDATE_INVITE_TOKEN = graphql(`
  query ValidateInviteToken($token: String!) {
    validateInviteToken(token: $token) {
      valid
      expired
      used
      data {
        email
        companyName
        invitedBy
        planName
      }
    }
  }
`)

export type ValidateInviteTokenData = ResultOf<typeof VALIDATE_INVITE_TOKEN>

export function validateInviteToken(request: Request, token: string) {
  return runQuery(request, VALIDATE_INVITE_TOKEN, { token })
}
