import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import {
  RequestParameters,
  QueryResponseCache,
  FetchFunction,
  Network,
  Store,
  Environment,
  RecordSource,
} from "relay-runtime";

import { fetchGraphQL } from "./utils/fetchGraphQL";

enum operationKind {
  MUTATION = "mutation",
  QUERY = "query",
}

const isMutation = (request: RequestParameters): boolean =>
  request.operationKind === operationKind.MUTATION;

const isQuery = (request: RequestParameters): boolean =>
  request.operationKind === operationKind.QUERY;

const oneMinute = 60 * 1000;

const queryResponseCache = new QueryResponseCache({
  size: 250,
  ttl: oneMinute,
});

const cacheHandler: FetchFunction = async (
  request,
  variables,
  cacheConfig,
  uploadables
) => {
  const queryID = request.text || "";
  const cacheKey = `${request.name}-${JSON.stringify(variables)}`;

  // Check network status
  const { isConnected } = await NetInfo.fetch();

  if (!isConnected) {
    // Offline scenario: try to read from AsyncStorage

    const cachedData = await AsyncStorage.getItem(cacheKey);

    if (cachedData) {
      const parsedData = JSON.parse(cachedData);

      queryResponseCache.set(queryID, variables, parsedData);

      return parsedData;
    }
  }

  // Online scenario: fetch data from server
  if (isMutation(request)) {
    queryResponseCache.clear();
    const mutationResult = await fetchGraphQL(
      request,
      variables,
      cacheConfig,
      uploadables
    );
    return mutationResult;
  }

  const fromCache = queryResponseCache.get(queryID, variables);

  if (isQuery(request) && fromCache !== null && !cacheConfig.force) {
    return fromCache;
  }

  const fromServer = await fetchGraphQL(
    request,
    variables,
    cacheConfig,
    uploadables
  );

  if (fromServer) {
    queryResponseCache.set(queryID, variables, fromServer);
    // Store in AsyncStorage only for queries when online
    if (isQuery(request)) {
      await AsyncStorage.setItem(cacheKey, JSON.stringify(fromServer));
    }
  }

  return fromServer;
};

export const network = Network.create(cacheHandler);

export const store = new Store(new RecordSource(), {
  gcReleaseBufferSize: 10,
});

export const environment = new Environment({ network, store });
