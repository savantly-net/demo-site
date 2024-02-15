import { gql } from "@/__generated__/gql";
import { getApolloRscClient } from "@/apollo";
import { first } from "@/lib/arrayHelpers";
import { getFirstImageUrl, getLocalizedField } from "@/lib/cmsHelpers";
import { Metadata, ResolvingMetadata } from "next";
import Image from "next/image";

// This is the query that will be used to get the homepage contents
// When you run `npm run codegen` this query will be used to generate the types
// for the data that will be returned from the query
// You can see the generated types in `src/__generated__/gql.ts`
// be sure to run `npm run codegen` after you make changes to the query
const GET_HOMEPAGE_QUERY = gql(/* GraphQL */ `
  query HomepageContents {
    queryHomepageContents {
      editToken
      status
      data {
        title {
          en
          es
        }
        headline {
          en
          es
        }
        heroImage {
          iv {
            url
          }
        }
        features {
          iv {
            text
            image {
              url
            }
          }
        }
      }
    }
  }
`);

async function getData() {
  return await getApolloRscClient().query({
    query: GET_HOMEPAGE_QUERY,
  });
}

type Props = {
  params: { lang: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // read route params
  const lang = params.lang;
  const data = await getData();
  const contents = first(data.data.queryHomepageContents!);

  // optionally access and extend (rather than replace) parent metadata
  const previousImages = (await parent).openGraph?.images || [];

  const title = getLocalizedField(lang, contents.data.title);
  const headline = getLocalizedField(lang, contents.data.headline);

  return {
    title: title,
    description: headline,
    openGraph: {
      images: [...previousImages],
      description: headline,
    },
  };
}

export default async function Home({ params, searchParams }: Props) {
  // our query's result, data, is typed!
  const data = await getData();
  const contents = first(data.data.queryHomepageContents!);
  const title = getLocalizedField(params.lang, contents.data.title);
  const headline = getLocalizedField(params.lang, contents.data.headline);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <div className="z-10 max-w-5xl w-full items-center justify-between">
        <p
          className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 text-white p-6 backdrop-filter backdrop-blur"
          style={{ backgroundColor: "rgb(var(--background-rgb))" }}
          squidex-token={contents.editToken}
        >
          {title}
        </p>
      </div>

      <div className="relative flex items-center justify-center w-full h-96 mt-8">
        {/* HERO IMAGE as background */}
        <Image
          squidex-token={contents.editToken}
          src={getFirstImageUrl(contents.data.heroImage?.iv)}
          layout="fill"
          objectFit="cover"
          alt={title}
        />

        <div className="absolute inset-0" />
        <h1
          className="z-10 text-white text-6xl font-bold"
          squidex-token={contents.editToken}
        >
          {headline}
        </h1>
      </div>

      <div className="relative flex items-start py-4">
        {/* FEATURE BLOCKS */}
        {contents.data.features?.iv?.map((feature, index) => (
          <div
            key={index}
            className="flex flex-col items-start justify-center p-8 space-y-4 items-center w-1/3"
          >
            <Image
              squidex-token={contents.editToken}
              src={getFirstImageUrl(feature.image)}
              className="w-128 h-128 rounded-full"
              alt="feature"
              width={300}
              height={300}
            />
            <div
              squidex-token={contents.editToken}
              className="text-center"
              dangerouslySetInnerHTML={{ __html: feature.text || "" }}
            ></div>
          </div>
        ))}
      </div>

      <div className="mb-32 grid text-center"></div>

      <div className="flex h-48 w-full items-end justify-center">
        <a
          className="pointer-events-none flex place-items-center gap-2 p-8"
          href="https://savantly.net"
          target="_blank"
          rel="noopener noreferrer"
        >
          Savantly LLC
        </a>
      </div>
    </main>
  );
}
