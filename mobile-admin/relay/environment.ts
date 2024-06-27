import {
  CacheConfig,
  Environment,
  GraphQLResponse,
  Network,
  QueryResponseCache,
  RecordSource,
  RequestParameters,
  Store,
  UploadableMap,
  Variables,
} from "relay-runtime";
import type { FetchFunction, IEnvironment } from "relay-runtime";

export const GRAPHQL_URL = `http://localhost:8000/graphql`;

const getRequestBody = (
  request: RequestParameters,
  variables: Variables,
  uploadables: UploadableMap | null | undefined
): FormData | string => {
  if (uploadables) {
    const formData = new FormData();

    Object.entries(uploadables).forEach(([key, value]) => {
      formData.append(key, value);
    });

    return formData;
  }

  return JSON.stringify({ query: request.text, variables });
};

async function fetchGraphQL(
  request: RequestParameters,
  variables: Variables,
  _cacheConfig: CacheConfig,
  uploadables?: UploadableMap | null | undefined
): Promise<GraphQLResponse> {
  const body = getRequestBody(request, variables, uploadables);

  const headers: HeadersInit = {
    Accept: uploadables ? "*/*" : "application/json",
  };

  if (!uploadables) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(GRAPHQL_URL, {
    method: "POST",
    credentials: "same-origin",
    headers,
    body,
  });

  const result = await response.json();

  return result;
}

enum operationKind {
  MUTATION = "mutation",
  QUERY = "query",
}

export const isMutation = (request: RequestParameters): boolean =>
  request.operationKind === operationKind.MUTATION;

export const isQuery = (request: RequestParameters): boolean =>
  request.operationKind === operationKind.QUERY;

export const forceFetch = (cacheConfig: CacheConfig): boolean =>
  !!(cacheConfig && cacheConfig.force);

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

  if (isQuery(request) && fromCache !== null && !forceFetch(cacheConfig))
    return fromCache;

  const fromServer = await fetchGraphQL(
    request,
    variables,
    cacheConfig,
    uploadables
  );

  if (fromServer)
    queryResponseCache.set(queryID, variables, fromServer as GraphQLResponse);

  return fromServer;
};

export function createEnvironment(): IEnvironment {
  const network = Network.create(cacheHandler);
  const store = new Store(new RecordSource());
  return new Environment({ store, network });
}
