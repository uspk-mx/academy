import { initGraphQLTada } from 'gql.tada'
import type { introspection } from './graphql-env.d.ts'

export type JsonValue =
  string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }

export type RichTextAST = {
  children?: JsonValue[]
  [key: string]: JsonValue | undefined
}

export const graphql = initGraphQLTada<{
  introspection: introspection
  scalars: {
    Date: string
    DateTime: string
    Hex: string
    Json: JsonValue
    Long: number
    RGBAHue: number
    RGBATransparency: number
    RichTextAST: RichTextAST
  }
}>()

export type { FragmentOf, ResultOf, VariablesOf } from 'gql.tada'
export { readFragment } from 'gql.tada'
