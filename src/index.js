// Import these two es7 features until we drop Node 4 support
import 'core-js/modules/es7.object.entries'; // eslint-disable-line

import contentItemResolvers from './graphql/resolvers';
import contentItemTypeDefs from './graphql/typeDefs.graphql';
import startGraphqlMdServer from './markdown-content/startGraphqlMdServer';
import { dataStore, insert, find, findOne } from './database/in-memory-storage';

export { contentItemResolvers, contentItemTypeDefs, startGraphqlMdServer, dataStore, insert, find, findOne };
