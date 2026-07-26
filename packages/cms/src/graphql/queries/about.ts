import { cmsAPIClient } from "@academy/cms/api-client"
import { graphql, ResultOf, VariablesOf } from "../graphql"

const ABOUT_PAGE_QUERY = graphql(`
  query AboutPages($locale: Locale!) {
    aboutPages(locales: [$locale]) {
      id
      title
      teamTitle
      publishedAt
      missionTitle
      missionBody
      historyTitle
      historyBody
      founderQuote
      founderAttribution
      founderBgImage {
        id
        height
        fileName
        mimeType
        size
        url
        width
      }
      body
      audienceTitle
      audienceDescription
      audienceCards {
        id
        title
        tone
        order
        description
      }
      image {
        id
        size
        url
        width
        mimeType
        fileName
        height
      }
      teamMembers {
        id
        name
        role
        tone
        photo {
          fileName
          id
          height
          mimeType
          size
          url
          width
        }
      }
    }
  }
`)

export type AboutPageData = ResultOf<typeof ABOUT_PAGE_QUERY>
export type AboutPageVariables = VariablesOf<typeof ABOUT_PAGE_QUERY>

export async function getAboutPage({
  variables,
}: {
  variables: AboutPageVariables
}): Promise<AboutPageData> {
  return cmsAPIClient(ABOUT_PAGE_QUERY, variables)
}
