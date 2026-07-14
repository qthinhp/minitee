import React, { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { supabase } from "../lib/supabase";
import { NFC_MOCK_MODE, tagUrl, writeAndLockTag } from "../lib/nfc";
import type { RootStackParamList } from "../lib/scanHandler";
import { Chip, Field, GlowCard, NeonButton, Screen } from "../ui/components";
import { colors, type } from "../ui/theme";

type Props = NativeStackScreenProps<RootStackParamList, "RegisterBottle">;

const SIZES = [350, 500, 750, 1000];

// Registration = create bottle -> write URL to blank sticker -> LOCK it.
// In mock mode (no stickers yet) we still create the bottle and show the URL,
// so the whole backend flow works today; writing happens when hardware lands.
export default function RegisterBottleScreen({ navigation }: Props) {
  const [nickname, setNickname] = useState("My bottle");
  const [capacity, setCapacity] = useState(500);
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState<{ shortCode: string; bottleId: string } | null>(null);

  const register = async () => {
    setBusy(true);
    const { data, error } = await supabase.rpc("register_bottle", {
      p_nickname: nickname.trim(),
      p_capacity_ml: capacity,
    });
    setBusy(false);
    if (error) return Alert.alert("Hmm", error.message);
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
      Alert.alert("Sticker ready! 🎉", "Stick it on your bottle and tap away.");
      navigation.goBack();
    } catch (e) {
      Alert.alert("NFC", e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen style={styles.container}>
      {!created ? (
        <>
          <Text style={styles.emoji}>✨</Text>
          <Text style={[type.title, styles.center]}>Set up a new sticker</Text>
          <Text style={[type.dim, styles.center]}>
            One sticker per bottle. Tap it after every refill and we do the rest.
          </Text>
          <GlowCard style={styles.card}>
            <Field label="Bottle name" value={nickname} onChangeText={setNickname}
              placeholder="e.g. Desk Bottle" />
            <Text style={type.label}>How much fits inside?</Text>
            <View style={styles.chips}>
              {SIZES.map((ml) => (
                <Chip key={ml} label={`${ml}ml`} active={capacity === ml}
                  onPress={() => setCapacity(ml)} />
              ))}
            </View>
            <NeonButton big title={busy ? "Creating…" : "Create my bottle"}
              onPress={register} disabled={busy || !nickname.trim()} />
          </GlowCard>
        </>
      ) : (
        <>
          <Text style={styles.emoji}>🎉</Text>
          <Text style={[type.title, styles.center]}>Bottle created!</Text>
          <GlowCard style={styles.card}>
            <Text style={type.label}>Its magic link</Text>
            <Text selectable style={styles.url}>{tagUrl(created.shortCode)}</Text>
            {NFC_MOCK_MODE ? (
              <Text style={type.dim}>
                Your stickers haven't arrived yet — no problem! The bottle
                already works with the simulate button. When the stickers land,
                flip NFC_MOCK_MODE off in src/lib/nfc.ts and come back here to
                write this link onto one. (Or use any NFC-writer app + its
                lock option, or print it as a QR code.)
              </Text>
            ) : (
              <Text style={type.dim}>
                Hold your phone flat on the blank sticker. Writing also locks
                it forever, so nobody can mess with it. 🔒
              </Text>
            )}
            <NeonButton big title={busy ? "Writing…" : "📡 Write to sticker"}
              onPress={writeTag} disabled={busy || NFC_MOCK_MODE} />
            <NeonButton kind="ghost" title="Later — take me back"
              onPress={() => navigation.goBack()} />
          </GlowCard>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { justifyContent: "center", gap: 10 },
  emoji: { fontSize: 64, textAlign: "center" },
  center: { textAlign: "center" },
  card: { marginTop: 14, gap: 14 },
  chips: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  url: {
    fontSize: 15, padding: 12, borderRadius: 12, color: colors.aqua,
    backgroundColor: "rgba(57,214,255,0.1)", fontFamily: "monospace" as const,
  },
});
