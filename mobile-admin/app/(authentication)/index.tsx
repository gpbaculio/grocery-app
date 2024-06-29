import React, { Suspense } from "react";
import {
  DynamicPressable,
  DynamicText,
  DynamicView,
  ErrorBoundaryWithRetry,
} from "@/components";
import { ActivityIndicator } from "react-native";
import IndexTest from "@/components/(authentication)/indexTest";
import { ErrorBoundaryFallbackProps } from "@/components/ErrorBoundaryWithRetry";

const ErrorUI = ({ error, retry }: ErrorBoundaryFallbackProps) => (
  <DynamicView flex={1} justifyContent="center" alignItems="center">
    <DynamicText>{error}</DynamicText>
    <DynamicPressable
      backgroundColor="danger"
      paddingHorizontal="L"
      paddingVertical="M"
      marginTop="S"
      onPress={retry}
    >
      <DynamicText color="success">Retry</DynamicText>
    </DynamicPressable>
  </DynamicView>
);

const Login = () => {
  return (
    <ErrorBoundaryWithRetry
      fallback={({ error, retry }) => <ErrorUI error={error} retry={retry} />}
    >
      {({ fetchKey }) => {
        // If we have retried, use the new `retryQueryRef` provided
        // by the Error Boundary
        return (
          <Suspense
            fallback={
              <DynamicView
                width="100%"
                borderRadius={4}
                justifyContent="center"
                alignItems="center"
              >
                <DynamicText>Loading...</DynamicText>
                <ActivityIndicator size="small" color="#868f99" />
              </DynamicView>
            }
          >
            <IndexTest fetchKey={fetchKey} />
          </Suspense>
        );
      }}
    </ErrorBoundaryWithRetry>
  );
};

export default Login;
