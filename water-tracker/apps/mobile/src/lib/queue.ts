// Offline-first scan queue.
// Scans append here FIRST, then we try to sync. The scan UX never waits on
// the network — you're often at a gym or on a trail when you refill.
// Idempotency: each item carries a client_event_id (UUID); the server has a
// unique (user_id, client_event_id) index, so retries can never duplicate.

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import { supabase } from "./supabase";

const KEY = "scan-queue-v1";

export type QueuedScan = {
  clientEventId: string;
  shortCode: string;
  valueMl: number | null; // null = server uses the user's capacity for that bottle
  occurredAt: string;
  source: "nfc" | "qr" | "manual";
};

async function load(): Promise<QueuedScan[]> {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : [];
}

async function save(items: QueuedScan[]) {
  await AsyncStorage.setItem(KEY, JSON.stringify(items));
}

/** Append a scan and kick off a sync attempt. Returns the client_event_id. */
export async function enqueueScan(
  shortCode: string,
  source: QueuedScan["source"],
  valueMl: number | null = null,
): Promise<string> {
  const item: QueuedScan = {
    clientEventId: Crypto.randomUUID(),
    shortCode,
    valueMl,
    occurredAt: new Date().toISOString(),
    source,
  };
  const items = await load();
  items.push(item);
  await save(items);
  void flushQueue();
  return item.clientEventId;
}

/** Adjust a scan's amount (the ¾/½/¼ chips). Works whether or not it synced. */
export async function adjustScan(clientEventId: string, valueMl: number) {
  const items = await load();
  const pending = items.find((i) => i.clientEventId === clientEventId);
  if (pending) {
    pending.valueMl = valueMl;
    await save(items);
    void flushQueue();
    return;
  }
  // Already synced — update the row (RLS scopes this to our own events).
  await supabase.from("events").update({ value: valueMl })
    .eq("client_event_id", clientEventId);
}

export async function removeScan(clientEventId: string) {
  const items = await load();
  await save(items.filter((i) => i.clientEventId !== clientEventId));
  await supabase.from("events").delete().eq("client_event_id", clientEventId);
}

let flushing = false;

/** Push queued scans to the server. Safe to call anytime (fires on app
 *  foreground and after every enqueue). Items stay queued on failure. */
export async function flushQueue(): Promise<void> {
  if (flushing) return;
  flushing = true;
  try {
    let items = await load();
    for (const item of [...items]) {
      const { error } = await supabase.rpc("log_bottle_scan", {
        p_short_code: item.shortCode,
        p_client_event_id: item.clientEventId,
        p_occurred_at: item.occurredAt,
        p_value_ml: item.valueMl,
        p_source: item.source,
      });
      if (error) {
        // 'bottle not linked' means this scan needs the link flow, not a retry
        if (error.message.includes("bottle not linked")) {
          items = items.filter((i) => i.clientEventId !== item.clientEventId);
          await save(items);
        }
        // network/auth errors: keep item, try again on next flush
        continue;
      }
      items = items.filter((i) => i.clientEventId !== item.clientEventId);
      await save(items);
    }
  } finally {
    flushing = false;
  }
}

export async function pendingCount(): Promise<number> {
  return (await load()).length;
}
