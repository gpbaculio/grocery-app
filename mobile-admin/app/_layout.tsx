import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import * as ScreenOrientation from "expo-screen-orientation";
import { ThemeProvider } from "@shopify/restyle";

import theme from "@/constants/theme";
import RelayEnvironment from "@/relay/RelayEnvironment";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    const onLoadAsync = async () => {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.LANDSCAPE_LEFT
      );
      await SplashScreen.hideAsync();
    };

    if (loaded) {
      onLoadAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <RelayEnvironment>
      <ThemeProvider theme={theme}>
        <Stack initialRouteName="(authentication)">
          <Stack.Screen
            name="(authentication)"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="+not-found" />
        </Stack>
      </ThemeProvider>
    </RelayEnvironment>
  );
}
