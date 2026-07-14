import React, { useEffect, useState } from "react";
import { AppState } from "react-native";
import { DarkTheme, NavigationContainer, Theme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import * as Linking from "expo-linking";
import type { Session } from "@supabase/supabase-js";

import { supabase } from "./src/lib/supabase";
import { flushQueue } from "./src/lib/queue";
import { registerPushToken } from "./src/lib/notifications";
import {
  handleScan, navigationRef, parseShortCode, RootStackParamList,
} from "./src/lib/scanHandler";

import { colors } from "./src/ui/theme";
import AuthScreen from "./src/screens/AuthScreen";
import TodayScreen from "./src/screens/TodayScreen";
import ScanConfirmScreen from "./src/screens/ScanConfirmScreen";
import LinkBottleScreen from "./src/screens/LinkBottleScreen";
import RegisterBottleScreen from "./src/screens/RegisterBottleScreen";
import SettingsScreen from "./src/screens/SettingsScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg,
    card: colors.bg,
    text: colors.text,
    primary: colors.aqua,
    border: "transparent",
  },
};

const headerStyle = {
  headerStyle: { backgroundColor: colors.bgTop },
  headerTintColor: colors.text,
  headerShadowVisible: false,
  headerTitleStyle: { fontWeight: "700" as const },
};

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setBooted(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  // Deep links: this is how background NFC reads reach us.
  useEffect(() => {
    const onUrl = (url: string | null) => {
      const code = url && parseShortCode(url);
      if (code) void handleScan(code, "nfc");
    };
    Linking.getInitialURL().then(onUrl);
    const sub = Linking.addEventListener("url", (e) => onUrl(e.url));
    return () => sub.remove();
  }, []);

  // Sync the offline queue whenever the app comes to the foreground.
  useEffect(() => {
    void flushQueue();
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") void flushQueue();
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (session) void registerPushToken();
  }, [session]);

  if (!booted) return null;

  return (
    <NavigationContainer ref={navigationRef} theme={navTheme}>
      <StatusBar style="light" />
      <Stack.Navigator screenOptions={headerStyle}>
        {session ? (
          <>
            <Stack.Screen name="Today" component={TodayScreen}
              options={{ title: "💧 Today" }} />
            <Stack.Screen name="ScanConfirm" component={ScanConfirmScreen}
              options={{ title: "", presentation: "modal" }} />
            <Stack.Screen name="LinkBottle" component={LinkBottleScreen}
              options={{ title: "New bottle" }} />
            <Stack.Screen name="RegisterBottle" component={RegisterBottleScreen}
              options={{ title: "New sticker" }} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthScreen}
            options={{ headerShown: false }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
