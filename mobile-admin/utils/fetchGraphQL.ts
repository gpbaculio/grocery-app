import {
  CacheConfig,
  GraphQLResponse,
  RequestParameters,
  UploadableMap,
  Variables,
} from "relay-runtime";

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

export async function fetchGraphQL(
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
