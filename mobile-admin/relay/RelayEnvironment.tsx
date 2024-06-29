import React from "react";

import { RelayEnvironmentProvider } from "react-relay";

import { createEnvironment } from "./environment";
import { SQLiteProvider } from "expo-sqlite";

export default function RelayEnvironment({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const environment = createEnvironment();

  return (
    <SQLiteProvider databaseName="philsari.db">
      <RelayEnvironmentProvider environment={environment}>
        {children}
      </RelayEnvironmentProvider>
    </SQLiteProvider>
  );
}
