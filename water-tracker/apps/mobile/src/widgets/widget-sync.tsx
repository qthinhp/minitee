// Push today's numbers to the home-screen widgets on both platforms.
// Called after every log/refresh. Never throws — widgets are best-effort.

import React from "react";
import { Platform } from "react-native";
import { APP_GROUP, localDay, saveWidgetData } from "./widget-data";

export async function syncWidgets(totalMl: number, goalMl: number | null): Promise<void> {
  const data = { totalMl, goalMl, day: localDay() };
  try {
    await saveWidgetData(data);

    if (Platform.OS === "android") {
      const { requestWidgetUpdate } = await import("react-native-android-widget");
      const { HydrationWidget } = await import("./HydrationWidget");
      await requestWidgetUpdate({
        widgetName: "Hydration",
        renderWidget: () => <HydrationWidget totalMl={totalMl} goalMl={goalMl} />,
      });
    } else if (Platform.OS === "ios") {
      // Mirror into App Group defaults for the WidgetKit extension,
      // then ask iOS to redraw the widget timeline.
      const { setItem, reloadAllTimelines } = await import("react-native-widgetkit");
      await setItem("total_ml", String(totalMl), APP_GROUP);
      await setItem("goal_ml", String(goalMl ?? 0), APP_GROUP);
      await setItem("day", data.day, APP_GROUP);
      reloadAllTimelines();
    }
  } catch {
    // Widget module not linked yet (e.g. Expo Go / first dev build) — fine.
  }
}
