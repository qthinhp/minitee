// ONE code path for every way a scan can arrive:
//   - background NFC read  -> OS opens https://<domain>/t/<code> as a deep link
//   - in-app foreground read (nfc.ts readTag)
//   - QR scan of the fallback code (same URL)
//   - the __DEV__ "Simulate scan" button (no hardware needed)

import { createNavigationContainerRef } from "@react-navigation/native";
import { supabase } from "./supabase";
import { enqueueScan } from "./queue";
import { rescheduleNudge } from "./notifications";

export type RootStackParamList = {
  Auth: undefined;
  Today: undefined;
  ScanConfirm: { clientEventId: string; nickname: string; capacityMl: number };
  LinkBottle: { shortCode: string };
  RegisterBottle: undefined;
  Settings: undefined;
  History: undefined;
};

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function parseShortCode(url: string): string | null {
  const match = url.match(/(?:\/t\/|^minitee:\/\/t\/)([a-z0-9]+)/i);
  return match ? match[1].toLowerCase() : null;
}

/** Handle a scanned bottle code end-to-end. */
export async function handleScan(
  shortCode: string,
  source: "nfc" | "qr" = "nfc",
): Promise<void> {
  if (!navigationRef.isReady()) return;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    navigationRef.navigate("Auth");
    return;
  }

  // Is this bottle linked to me?
  const { data: link } = await supabase
    .from("user_bottles")
    .select("nickname, capacity_ml, bottles!inner(short_code)")
    .eq("bottles.short_code", shortCode)
    .eq("is_active", true)
    .maybeSingle();

  if (!link) {
    // Friend's sticker (or a fresh one): offer to link it to this account.
    navigationRef.navigate("LinkBottle", { shortCode });
    return;
  }

  // Fast path: log immediately (offline-safe), confirm screen allows adjusting.
  const clientEventId = await enqueueScan(shortCode, source);
  void rescheduleNudge();
  navigationRef.navigate("ScanConfirm", {
    clientEventId,
    nickname: link.nickname,
    capacityMl: link.capacity_ml,
  });
}
