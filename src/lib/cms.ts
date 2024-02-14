import { SquidexClient } from "@squidex/squidex";


export const schemaUri = `${process.env.CMS_SERVER_URL}/api/content/${process.env.CMS_APP_NAME}/graphql`;

const sdk = new SquidexClient({
  appName: process.env.CMS_APP_NAME!,
  clientId: process.env.CMS_CLIENT_ID!,
  clientSecret: process.env.CMS_CLIENT_SECRET!,
  environment: process.env.CMS_SERVER_URL!,
});

interface GetAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

export const getAuthToken = async () => {
  const authUrl = `${process.env.CMS_SERVER_URL}/identity-server/connect/token`
  const token: GetAuthTokenResponse = await fetch(authUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: process.env.CMS_CLIENT_ID!,
      client_secret: process.env.CMS_CLIENT_SECRET!,
      grant_type: "client_credentials",
      scope: "squidex-api"
    })
  }).then((res) => res.json());
  return token;
}