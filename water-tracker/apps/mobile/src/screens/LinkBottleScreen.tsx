import React, { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { supabase } from "../lib/supabase";
import { handleScan, RootStackParamList } from "../lib/scanHandler";
import { Chip, Field, GlowCard, NeonButton, Screen } from "../ui/components";
import { type } from "../ui/theme";

type Props = NativeStackScreenProps<RootStackParamList, "LinkBottle">;

const SIZES = [350, 500, 750, 1000];

// A scanned sticker isn't linked to this account yet — a friend's bottle, or
// a brand-new one. Linking is per-person: your fill amount can differ from theirs.
export default function LinkBottleScreen({ route, navigation }: Props) {
  const { shortCode } = route.params;
  const [nickname, setNickname] = useState("My bottle");
  const [capacity, setCapacity] = useState(500);
  const [busy, setBusy] = useState(false);

  const link = async () => {
    setBusy(true);
    const { error } = await supabase.rpc("link_bottle", {
      p_short_code: shortCode,
      p_nickname: nickname.trim(),
      p_capacity_ml: capacity,
    });
    setBusy(false);
    if (error) return Alert.alert("Hmm, that didn't work", error.message);
    // Log the scan that brought us here.
    navigation.goBack();
    void handleScan(shortCode, "nfc");
  };

  return (
    <Screen style={styles.container}>
      <Text style={styles.emoji}>🫧</Text>
      <Text style={[type.title, styles.center]}>Ooh, a new bottle!</Text>
      <Text style={[type.dim, styles.center]}>
        Let's make it yours. Even if a friend uses this same sticker, your
        sips stay on your account and theirs on theirs. ✌️
      </Text>

      <GlowCard style={styles.card}>
        <Field label="Give it a name" value={nickname} onChangeText={setNickname}
          placeholder="e.g. Big Blue" />
        <Text style={type.label}>How much fits inside?</Text>
        <View style={styles.chips}>
          {SIZES.map((ml) => (
            <Chip key={ml} label={`${ml}ml`} active={capacity === ml}
              onPress={() => setCapacity(ml)} />
          ))}
        </View>
        <NeonButton
          big
          title={busy ? "Linking…" : "Link it & log my first sip 💧"}
          onPress={link}
          disabled={busy || !nickname.trim()}
        />
      </GlowCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { justifyContent: "center", gap: 10 },
  emoji: { fontSize: 64, textAlign: "center" },
  center: { textAlign: "center" },
  card: { marginTop: 14, gap: 14 },
  chips: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
});
