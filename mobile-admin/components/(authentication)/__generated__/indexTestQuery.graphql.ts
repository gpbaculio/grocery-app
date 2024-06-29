/**
 * @generated SignedSource<<3888a5172abd5e2d661cb4c6f8bc9615>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from "relay-runtime";
export type indexTestQuery$variables = Record<PropertyKey, never>;
export type indexTestQuery$data = {
  readonly test: string | null | undefined;
};
export type indexTestQuery = {
  response: indexTestQuery$data;
  variables: indexTestQuery$variables;
};

const node: ConcreteRequest = (function () {
  var v0 = [
    {
      alias: null,
      args: null,
      kind: "ScalarField",
      name: "test",
      storageKey: null,
    },
  ];
  return {
    fragment: {
      argumentDefinitions: [],
      kind: "Fragment",
      metadata: null,
      name: "indexTestQuery",
      selections: v0 /*: any*/,
      type: "Query",
      abstractKey: null,
    },
    kind: "Request",
    operation: {
      argumentDefinitions: [],
      kind: "Operation",
      name: "indexTestQuery",
      selections: v0 /*: any*/,
    },
    params: {
      cacheID: "db18fe1e4285a75999c64352fca1f808",
      id: null,
      metadata: {},
      name: "indexTestQuery",
      operationKind: "query",
      text: "query indexTestQuery {\n  test\n}\n",
    },
  };
})();

(node as any).hash = "2f478bdb6f34c3bc837546d5ffc74eba";

export default node;
