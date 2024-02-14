"use client";
import { ApolloLink, HttpLink } from "@apollo/client";
import {
  ApolloNextAppProvider,
  NextSSRApolloClient,
  NextSSRInMemoryCache,
  SSRMultipartLink,
} from "@apollo/experimental-nextjs-app-support/ssr";
import React from "react";

import { loadDevMessages, loadErrorMessages } from "@apollo/client/dev";
import { setVerbosity } from "ts-invariant";

if (process.env.NODE_ENV === "development") {
  setVerbosity("debug");
  loadDevMessages();
  loadErrorMessages();
}

export interface ApolloWrapperProps {
  schemaUri: string;
  authToken?: string;
}

// have a function to create a client for you
const makeClient = ({ schemaUri, authToken }: ApolloWrapperProps) => {
  return () => {
    const httpLink = new HttpLink({
      // this needs to be an absolute url, as relative urls cannot be used in SSR
      uri: schemaUri,
      // you can disable result caching here if you want to
      // (this does not work if you are rendering your page with `export const dynamic = "force-static"`)
      fetchOptions: { cache: "no-store" },
      // you can override the default `fetchOptions` on a per query basis
      // via the `context` property on the options passed as a second argument
      // to an Apollo Client data fetching hook, e.g.:
      // const { data } = useSuspenseQuery(MY_QUERY, { context: { fetchOptions: { cache: "force-cache" }}});
      
      /*
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      */
    });

    return new NextSSRApolloClient({
      // use the `NextSSRInMemoryCache`, not the normal `InMemoryCache`
      cache: new NextSSRInMemoryCache(),
      link:
        typeof window === "undefined"
          ? ApolloLink.from([
              // in a SSR environment, if you use multipart features like
              // @defer, you need to decide how to handle these.
              // This strips all interfaces with a `@defer` directive from your queries.
              new SSRMultipartLink({
                stripDefer: true,
              }),
              httpLink,
            ])
          : httpLink,
    });
  };
};

// you need to create a component to wrap your app in
export function ApolloWrapper({
  children,
  schemaUri,
  authToken,
}: ApolloWrapperProps & React.PropsWithChildren) {
  return (
    <ApolloNextAppProvider makeClient={makeClient({ schemaUri, authToken })}>
      {children}
    </ApolloNextAppProvider>
  );
}
