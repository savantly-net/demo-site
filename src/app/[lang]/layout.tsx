import { gql } from "@/__generated__";
import { getApolloRscClient } from "@/apollo";
import { ApolloWrapper } from "@/apollo/ApolloWrapper";
import { first } from "@/lib/arrayHelpers";
import { schemaUri } from "@/lib/cms";
import { getLocalizedField, useLocalizedField } from "@/lib/cmsHelpers";
import { getRGBColor } from "@/lib/color";
import { supportedLocales } from "@/lib/localizationHelpers";
import type { Metadata, ResolvingMetadata } from "next";
import { Poppins } from "next/font/google";
import "../globals.css";

type Props = {
  params: { lang: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

const inter = Poppins({ subsets: ["latin"], weight: "400" });

const GET_ROOT_LAYOUT_QUERY = gql(/* GraphQL */ `
  query RootLayoutContents {
    queryRootlayoutContents {
      editToken
      data {
        title {
          en
          es
        }
        description {
          en
          es
        }
        backgroundColorStart {
          iv
        }
        backgroundColorEnd {
          iv
        }
        ogImage {
          iv {
            url
          }
        }
      }
    }
  }
`);

// Return a list of `langs` to populate the [lang] dynamic segment
export async function generateStaticParams() {
  return supportedLocales.map((l) => ({
    lang: l,
  }));
}

async function getData() {
  var queryData = await getApolloRscClient().query({
    query: GET_ROOT_LAYOUT_QUERY,
  });
  return {
    data: queryData.data,
  };
}

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // read route params
  const lang = params.lang;
  const data = await getData();
  const contents = first(data.data.queryRootlayoutContents!);

  // optionally access and extend (rather than replace) parent metadata
  const previousImages = (await parent).openGraph?.images || [];

  const title = getLocalizedField(lang, contents.data.title);
  const description = getLocalizedField(lang, contents.data.description);
  const ogImage = first(contents.data.ogImage?.iv!).url;

  return {
    title: title,
    description: description,
    openGraph: {
      images: [ogImage, ...previousImages],
      description: description,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const localize = useLocalizedField();

  const data = await getData();
  const contents = first(data.data.queryRootlayoutContents!);

  const backgroundStartRgb = getRGBColor(
    localize(contents.data.backgroundColorStart)
  );
  const backgroundEndtRgb = getRGBColor(
    localize(contents.data.backgroundColorEnd)
  );

  return (
    <html
      lang="en"
      style={
        {
          "--background-start-rgb": backgroundStartRgb,
          "--background-end-rgb": backgroundEndtRgb,
        } as any
      }
    >
      <body className={inter.className}>
        <ApolloWrapper schemaUri={schemaUri}>{children}</ApolloWrapper>
        <script
          key="embed-cms"
          async
          src="https://content.savantly.cloud/scripts/embed-sdk.js"
        />
      </body>
    </html>
  );
}
