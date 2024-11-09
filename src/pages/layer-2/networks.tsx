import { useRouter } from "next/router"
import type { GetStaticProps } from "next/types"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

import type { BasePageProps, Lang } from "@/lib/types"

import { ButtonLink } from "@/components/Buttons"
import Callout from "@/components/Callout"
import { ContentHero, ContentHeroProps } from "@/components/Hero"
import Layer2NetworksTable from "@/components/Layer2NetworksTable"
import MainArticle from "@/components/MainArticle"
import PageMetadata from "@/components/PageMetadata"

import { dataLoader } from "@/lib/utils/data/dataLoader"
import { existsNamespace } from "@/lib/utils/existsNamespace"
import { getLastDeployDate } from "@/lib/utils/getLastDeployDate"
import { getLocaleTimestamp } from "@/lib/utils/time"
import { getRequiredNamespacesForPage } from "@/lib/utils/translations"

import { layer2Data } from "@/data/layer-2/layer-2"

import { BASE_TIME_UNIT } from "@/lib/constants"

import { fetchGrowThePie } from "@/lib/api/fetchGrowThePie"
import { fetchL2beat } from "@/lib/api/fetchL2beat"
import Callout2Image from "@/public/images/layer-2/layer-2-walking.png"
import Callout1Image from "@/public/images/man-and-dog-playing.png"

// In seconds
const REVALIDATE_TIME = BASE_TIME_UNIT * 1

const loadData = dataLoader(
  [
    ["growThePieData", fetchGrowThePie],
    ["l2beatData", fetchL2beat],
  ],
  REVALIDATE_TIME * 1000
)

export const getStaticProps = (async ({ locale }) => {
  const [growThePieData, l2beatData] = await loadData()

  const lastDeployDate = getLastDeployDate()
  const lastDeployLocaleTimestamp = getLocaleTimestamp(
    locale as Lang,
    lastDeployDate
  )

  const requiredNamespaces = getRequiredNamespacesForPage("/layer-2/networks")

  const contentNotTranslated = !existsNamespace(locale!, requiredNamespaces[2])

  const layer2DataCompiled = layer2Data.map((network) => {
    return {
      ...network,
      txCosts: growThePieData.dailyTxCosts[network.growthepieID],
      l2beatData: l2beatData.data.projects[network.l2beatID],
    }
  })

  return {
    props: {
      ...(await serverSideTranslations(locale!, requiredNamespaces)),
      contentNotTranslated,
      lastDeployLocaleTimestamp,
      locale,
      layer2Data: layer2DataCompiled,
    },
  }
}) satisfies GetStaticProps<BasePageProps>

const Layer2Networks = ({ layer2Data, locale }) => {
  const { pathname } = useRouter()

  const heroProps: ContentHeroProps = {
    breadcrumbs: { slug: pathname, startDepth: 1 },
    heroImg: "/images/layer-2/learn-hero.png",
    blurDataURL: "/images/layer-2/learn-hero.png",
    title: "Choose network",
    description:
      "Using Ethereum today means interacting with hundreds of different networks and apps. All backed by Ethereum as the foundational backbone.",
  }

  return (
    <MainArticle className="relative flex flex-col">
      <PageMetadata
        title="Choose network"
        description="Using Ethereum today means interacting with hundreds of different networks and apps. All backed by Ethereum as the foundational backbone."
        image="/images/layer-2/learn-hero.png"
      />

      <ContentHero {...heroProps} />

      <Layer2NetworksTable layer2Data={layer2Data} locale={locale} />

      <div
        id="callout-cards"
        className="flex w-full flex-col px-8 py-9 lg:flex-row lg:gap-16"
      >
        <Callout
          image={Callout1Image}
          title={"What are the benefits?"}
          description={
            "Ethereum's strength and security provides a platform for other networks to build upon."
          }
        >
          <div>
            <ButtonLink href="/layer-2/">Learn more</ButtonLink>
          </div>
        </Callout>
        <Callout
          image={Callout2Image}
          title={"Interested in more details?"}
          description={
            "Curious about the technology and reasons for this scaling approach? Learn more about the thinking and different technological approaches."
          }
        >
          <div>
            <ButtonLink href="/layer-2/learn/">Learn more</ButtonLink>
          </div>
        </Callout>
      </div>
    </MainArticle>
  )
}

export default Layer2Networks
