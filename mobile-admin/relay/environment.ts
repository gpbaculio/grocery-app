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
import * as SQLite from "expo-sqlite";
import * as ExpoNetwork from "expo-network";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const GRAPHQL_URL = `http://localhost:8000/graphql/`;

enum operationKind {
  MUTATION = "mutation",
  QUERY = "query",
}

export const isMutation = (request: RequestParameters): boolean => {
  return request.operationKind === operationKind.MUTATION;
};

export const isQuery = (request: RequestParameters): boolean => {
  return request.operationKind === operationKind.QUERY;
};

const oneMinute = 60 * 1000;

const queryResponseCache = new QueryResponseCache({
  size: 250,
  ttl: oneMinute,
});

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

const saveResponseToSQLite = async (
  queryID: string,
  variables: Variables,
  response: GraphQLResponse
) => {
  const db = await SQLite.openDatabaseAsync("philsari.db");
  const variablesString = JSON.stringify(variables);
  const responseString = JSON.stringify(response);

  db.withExclusiveTransactionAsync(async (tx) => {
    await tx.runAsync(
      `CREATE TABLE IF NOT EXISTS graphql_cache (
          query_id TEXT PRIMARY KEY,
          variables TEXT,
          response TEXT
      );`
    );

    await tx.runAsync(
      "INSERT OR REPLACE INTO graphql_cache (query_id, variables, response) VALUES (?, ?, ?)",
      [queryID, variablesString, responseString]
    );
  });
};

const getResponseFromSQLite = async (queryID: string, variables: Variables) => {
  const db = await SQLite.openDatabaseAsync("philsari.db");
  const variablesString = JSON.stringify(variables);

  const result = await db.getFirstAsync(
    "SELECT response FROM graphql_cache WHERE query_id = ? AND variables = ?",
    [queryID, variablesString]
  );

  return result as GraphQLResponse;
};

const CSRF_TOKEN_URL = "http://localhost:8000/csrf/";

async function fetchCsrfToken() {
  try {
    const response = await fetch(CSRF_TOKEN_URL);
    if (!response.ok) {
      throw new Error("Failed to fetch CSRF token");
    }
    const { csrfToken } = await response.json();
    return csrfToken;
  } catch (error) {
    console.error("Error fetching CSRF token:", error);
    return null;
  }
}

async function fetchGraphQL(
  request: RequestParameters,
  variables: Variables,
  _cacheConfig: CacheConfig,
  uploadables?: UploadableMap | null | undefined
): Promise<GraphQLResponse> {
  const body = getRequestBody(request, variables, uploadables);

  const token = await AsyncStorage.getItem("token");
  let csrfToken = await AsyncStorage.getItem("csrfToken");

  // Fetch CSRF token if not already set
  if (!csrfToken) {
    csrfToken = await fetchCsrfToken();
    if (csrfToken) {
      // Store CSRF token for future use
      await AsyncStorage.setItem("csrfToken", csrfToken);
    }
  }

  const headers: HeadersInit = {
    Accept: uploadables ? "*/*" : "application/json",
  };

  if (!uploadables) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = token;
  }

  if (csrfToken) {
    headers["X-CSRFToken"] = csrfToken;
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

const getNetworkStatus = async () => {
  const networkState = await ExpoNetwork.getNetworkStateAsync();

  return networkState.isInternetReachable;
};

const cacheHandler: FetchFunction = async (
  request,
  variables,
  cacheConfig,
  uploadables
) => {
  const queryID = request.id ?? request?.cacheID ?? request.text;

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

  const isNetworkAvailable = await getNetworkStatus();

  const fromCache = queryResponseCache.get(queryID, variables);

  if (
    isNetworkAvailable &&
    isQuery(request) &&
    fromCache !== null &&
    !cacheConfig.force
  ) {
    return fromCache;
  }

  if (isNetworkAvailable) {
    const fromServer = await fetchGraphQL(
      request,
      variables,
      cacheConfig,
      uploadables
    );

    if (fromServer) {
      queryResponseCache.set(queryID, variables, fromServer);
      await saveResponseToSQLite(queryID, variables, fromServer);
    }

    return fromServer;
  } else {
    const fromSQLite = await getResponseFromSQLite(queryID, variables);
    if (fromSQLite) {
      return fromSQLite;
    } else {
      throw new Error("No cached data available and network is offline");
    }
  }
};

export function createEnvironment(): IEnvironment {
  const network = Network.create(cacheHandler);
  const store = new Store(new RecordSource());

  return new Environment({ store, network });
}
