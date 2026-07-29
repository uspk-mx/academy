import { getLocale } from "@academy/user-ui/lib/lang"
import {
  AboutContent,
  CtaBannerContent,
  TeamMember,
} from "@academy/user-ui/types/cms"
import { getAboutPage } from "../graphql/queries/about"
import { loadCtaBanner } from "./cta-banner"
import {
  audienceCardsJsonSchema,
  jsonItemId,
  parseJsonField,
} from "./json-fields"

export interface AboutPageData {
  content: AboutContent
  ctaBanner: CtaBannerContent
}

export async function loadAboutPage(lang: string): Promise<AboutPageData> {
  const locale = getLocale(lang)
  const [{ aboutPages }, ctaBanner] = await Promise.all([
    getAboutPage({
      variables: { locale: locale },
    }),
    loadCtaBanner({ lang }),
  ])

  const about = aboutPages[0]
  const audienceCards = parseJsonField(
    audienceCardsJsonSchema,
    about.audienceCardsJson,
    "AboutPage.audienceCardsJson"
  )

  return {
    content: {
      title: about.title,
      body: about.body,
      image: {
        alt: about.image?.fileName ?? "",
        url: about.image?.url ?? "",
        width: about.image?.width ?? 200,
        height: about.image?.height ?? 200,
      },
      founderQuote: {
        quote: about.founderQuote,
        attribution: about.founderAttribution ?? "",
      },
      history: {
        title: about.historyTitle ?? "",
        body: about.historyBody ?? "",
      },
      mission: {
        title: about.missionTitle ?? "",
        body: about.missionBody ?? "",
      },
      audience: {
        title: about.audienceTitle ?? "",
        description: about.audienceDescription ?? "",
        segments: audienceCards.map((card, index) => ({
          id: jsonItemId("audience", card, index),
          title: card.title,
          description: card.description,
          tone: card.tone,
        })),
      },
      team: {
        title: about.teamTitle ?? "",
        members: about.teamMembers.map((member) => ({
          id: member.id,
          name: member.name,
          photo: {
            url: member.photo?.url,
            height: member.photo?.height,
            width: member.photo?.width,
            alt: member.photo?.fileName,
          },
          role: member.role,
          tone: member.tone,
          order: member.order
        })) as unknown as TeamMember[],
      },
    },
    ctaBanner,
  }
}
