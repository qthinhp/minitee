// NFC read/write with a MOCK MODE so the whole app is testable before the
// physical stickers arrive. The primary logging path doesn't even use this
// module — background tag reads arrive as deep links (see scanHandler.ts).
// This module is for (a) in-app foreground scanning and (b) writing +
// locking a tag during bottle registration.

import { Platform } from "react-native";
import { TAG_DOMAIN } from "./supabase";

// Flip to false once your NTAG213 stickers arrive.
export const NFC_MOCK_MODE = true;

export function tagUrl(shortCode: string): string {
  return `https://${TAG_DOMAIN}/t/${shortCode}`;
}

export type TagReadResult = { shortCode: string; nfcUid: string | null };

export async function readTag(): Promise<TagReadResult> {
  if (NFC_MOCK_MODE) {
    // Simulates tapping a sticker. Pair with the "Simulate scan" dev button.
    return { shortCode: "mock01", nfcUid: "04:AA:BB:CC:DD:EE:FF" };
  }
  const NfcManager = (await import("react-native-nfc-manager")).default;
  const { NfcTech, Ndef } = await import("react-native-nfc-manager");

  await NfcManager.start();
  try {
    await NfcManager.requestTechnology(NfcTech.Ndef, {
      alertMessage: "Hold your phone near the bottle sticker",
    });
    const tag = await NfcManager.getTag();
    const record = tag?.ndefMessage?.[0];
    if (!record) throw new Error("Empty tag");
    const url = Ndef.uri.decodePayload(new Uint8Array(record.payload));
    const match = url?.match(/\/t\/([a-z0-9]+)/i);
    if (!match) throw new Error(`Not a bottle tag: ${url}`);
    return { shortCode: match[1], nfcUid: tag?.id ?? null };
  } finally {
    NfcManager.cancelTechnologyRequest().catch(() => {});
  }
}

/**
 * Write the bottle URL to a blank tag, then LOCK it (one-way!) so nobody can
 * overwrite the URL later. Returns the tag's factory UID for anti-spoof
 * storage on the bottle row.
 */
export async function writeAndLockTag(shortCode: string): Promise<string | null> {
  if (NFC_MOCK_MODE) {
    throw new Error(
      "Mock mode: no NFC hardware yet. The tag URL would be: " + tagUrl(shortCode),
    );
  }
  const NfcManager = (await import("react-native-nfc-manager")).default;
  const { NfcTech, Ndef } = await import("react-native-nfc-manager");

  await NfcManager.start();
  try {
    await NfcManager.requestTechnology(NfcTech.Ndef, {
      alertMessage: "Hold your phone on the blank sticker",
    });
    const tag = await NfcManager.getTag();
    const bytes = Ndef.encodeMessage([Ndef.uriRecord(tagUrl(shortCode))]);
    await NfcManager.ndefHandler.writeNdefMessage(bytes);
    // Permanent write-protect. Skip on iOS < NDEF-lock support gracefully.
    try {
      await NfcManager.ndefHandler.makeReadOnly();
    } catch (e) {
      if (Platform.OS === "android") throw e; // Android should always manage
    }
    return tag?.id ?? null;
  } finally {
    NfcManager.cancelTechnologyRequest().catch(() => {});
  }
}
