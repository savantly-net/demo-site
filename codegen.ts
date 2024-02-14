import { CodegenConfig } from '@graphql-codegen/cli';

// load the environment variables from the .env.development file
require('dotenv').config({ path: '.env.development' });


const schema = `${process.env.CMS_SERVER_URL}/api/content/${process.env.CMS_APP_NAME}/graphql`;

const config: CodegenConfig = {
  schema: schema,
  documents: ['src/**/*.{ts,tsx}'],
  generates: {
    './src/__generated__/': {
      preset: 'client',
      plugins: [],
      presetConfig: {
        gqlTagName: 'gql',
      }
    }
  },
  ignoreNoDocuments: true,
};

export default config;