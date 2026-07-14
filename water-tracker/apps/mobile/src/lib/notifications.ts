// Local in-day nudge. On every scan we reschedule a single notification for
// +3h — each new scan pushes it back, so it only fires when you've actually
// gone quiet. The end-of-day summary is a SERVER push (needs the day's sum);
// see supabase/functions/daily-summary.

import * as Notifications from "expo-notifications";
import { supabase } from "./supabase";

const NUDGE_HOURS = 3;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function ensurePermissions(): Promise<boolean> {
  const settings = await Notifications.getPermissionsAsync();
  if (settings.granted) return true;
  const req = await Notifications.requestPermissionsAsync();
  return req.granted;
}

/** Register the Expo push token so daily-summary can reach this device. */
export async function registerPushToken(): Promise<void> {
  try {
    if (!(await ensurePermissions())) return;
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").update({ expo_push_token: token }).eq("id", user.id);
    }
  } catch {
    // Push tokens need a physical device + EAS project; fine to skip in dev.
  }
}

export async function rescheduleNudge(): Promise<void> {
  if (!(await ensurePermissions())) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
  const fireAt = new Date(Date.now() + NUDGE_HOURS * 3600 * 1000);
  // Don't nudge into the night: only schedule if it lands between 8:00-21:00.
  const h = fireAt.getHours();
  if (h < 8 || h >= 21) return;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Time for a refill?",
      body: `Nothing logged in the last ${NUDGE_HOURS} hours.`,
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: fireAt },
  });
}
