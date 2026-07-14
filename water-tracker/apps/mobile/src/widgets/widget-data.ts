// Cached widget payload. The app writes it on every refresh/log; the Android
// headless widget task and the iOS WidgetKit extension read from it (iOS via
// App Group defaults mirrored in widget-sync).

import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "widget-data-v1";

export const APP_GROUP = "group.app.minitee.watertracker";

export type WidgetData = {
  totalMl: number;
  goalMl: number | null;
  /** Local YYYY-MM-DD the totals belong to (widgets reset visually next day). */
  day: string;
};

export function localDay(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export async function saveWidgetData(data: WidgetData): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(data));
}

export async function loadWidgetData(): Promise<WidgetData> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) {
      const data = JSON.parse(raw) as WidgetData;
      // Stale data from a previous day shows as 0, not yesterday's win.
      if (data.day === localDay()) return data;
      return { totalMl: 0, goalMl: data.goalMl, day: localDay() };
    }
  } catch {}
  return { totalMl: 0, goalMl: null, day: localDay() };
}
