import React, { useState } from "react";
import { Alert, Button, StyleSheet, Text, TextInput, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { supabase } from "../lib/supabase";
import { NFC_MOCK_MODE, tagUrl, writeAndLockTag } from "../lib/nfc";
import type { RootStackParamList } from "../lib/scanHandler";

type Props = NativeStackScreenProps<RootStackParamList, "RegisterBottle">;

// Registration = create bottle row -> write URL to blank sticker -> LOCK it.
// In mock mode (no stickers yet) we still create the bottle and show the URL,
// so the whole backend flow is exercisable today; writing happens later.
export default function RegisterBottleScreen({ navigation }: Props) {
  const [nickname, setNickname] = useState("My bottle");
  const [capacity, setCapacity] = useState("500");
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState<{ shortCode: string; bottleId: string } | null>(null);

  const register = async () => {
    setBusy(true);
    const { data, error } = await supabase.rpc("register_bottle", {
      p_nickname: nickname.trim(),
      p_capacity_ml: parseInt(capacity, 10),
    });
    setBusy(false);
    if (error) return Alert.alert("Error", error.message);
    setCreated({ shortCode: data.short_code, bottleId: data.id });
  };

  const writeTag = async () => {
    if (!created) return;
    try {
      setBusy(true);
      const uid = await writeAndLockTag(created.shortCode);
      if (uid) {
        await supabase.from("bottles").update({ nfc_uid: uid }).eq("id", created.bottleId);
      }
      Alert.alert("Done!", "Sticker written and locked. Stick it on and scan away.");
      navigation.goBack();
    } catch (e) {
      Alert.alert("NFC", e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      {!created ? (
        <>
          <Text style={styles.title}>Register a new sticker</Text>
          <Text style={styles.label}>Bottle name</Text>
          <TextInput style={styles.input} value={nickname} onChangeText={setNickname} />
          <Text style={styles.label}>Capacity (ml)</Text>
          <TextInput
            style={styles.input} value={capacity} onChangeText={setCapacity}
            keyboardType="number-pad"
          />
          <Button
            title={busy ? "..." : "Create bottle"} onPress={register}
            disabled={busy || !nickname.trim() || !(parseInt(capacity, 10) > 0)}
          />
        </>
      ) : (
        <>
          <Text style={styles.title}>Bottle created ✅</Text>
          <Text style={styles.label}>Tag URL</Text>
          <Text selectable style={styles.url}>{tagUrl(created.shortCode)}</Text>
          {NFC_MOCK_MODE ? (
            <Text style={styles.hint}>
              No NFC hardware yet (mock mode). When your stickers arrive, flip
              NFC_MOCK_MODE off in src/lib/nfc.ts and use "Write to sticker"
              below — or write this URL with any tag-writer app (e.g. NFC
              Tools) and enable its lock option. You can also print it as a QR
              code for the same sticker.
            </Text>
          ) : (
            <Text style={styles.hint}>
              Hold your phone on the blank sticker. Writing also LOCKS the tag
              permanently so nobody can rewrite it.
            </Text>
          )}
          <Button
            title={busy ? "..." : "Write to sticker"} onPress={writeTag}
            disabled={busy || NFC_MOCK_MODE}
          />
          <Button title="Later — back to Today" onPress={() => navigation.goBack()} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 10 },
  title: { fontSize: 22, fontWeight: "600", marginBottom: 8 },
  label: { fontWeight: "600", marginTop: 8 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12, fontSize: 16 },
  url: { fontSize: 16, padding: 12, backgroundColor: "#eef2f7", borderRadius: 8 },
  hint: { opacity: 0.7, lineHeight: 20 },
});
