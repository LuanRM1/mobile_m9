import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { useRouter } from "expo-router";
import { useUser } from "@/contexts/UserContext";
import React, { useEffect } from "react";

import { useColorScheme } from "@/hooks/useColorScheme";
import { UserProvider } from "@/contexts/UserContext";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) return null;

  return (
    <UserProvider>
      <InnerStack colorScheme={colorScheme} />
    </UserProvider>
  );
}

function InnerStack({
  colorScheme,
}: {
  colorScheme: string | null | undefined;
}) {
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.navigate("/nickname");
    }
  }, [user]);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen
          name="nickname"
          options={{ headerShown: false, presentation: "modal" }}
        />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
