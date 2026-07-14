import React, { useState } from "react";
import { Alert, Button, StyleSheet, Text, TextInput, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { supabase } from "../lib/supabase";
import { handleScan, RootStackParamList } from "../lib/scanHandler";

type Props = NativeStackScreenProps<RootStackParamList, "LinkBottle">;

// A scanned sticker isn't linked to this account yet — a friend's bottle, or
// a new phone. Linking is per-user: your fill amount can differ from theirs.
export default function LinkBottleScreen({ route, navigation }: Props) {
  const { shortCode } = route.params;
  const [nickname, setNickname] = useState("My bottle");
  const [capacity, setCapacity] = useState("500");
  const [busy, setBusy] = useState(false);

  const link = async () => {
    setBusy(true);
    const { error } = await supabase.rpc("link_bottle", {
      p_short_code: shortCode,
      p_nickname: nickname.trim(),
      p_capacity_ml: parseInt(capacity, 10),
    });
    setBusy(false);
    if (error) return Alert.alert("Couldn't link bottle", error.message);
    // Log the scan that brought us here.
    navigation.goBack();
    void handleScan(shortCode, "nfc");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>New bottle detected 🍼</Text>
      <Text style={styles.hint}>
        Sticker code: {shortCode}. Link it to your account — every scan will
        log YOUR fill amount, even if a friend uses the same sticker.
      </Text>
      <Text style={styles.label}>Name</Text>
      <TextInput style={styles.input} value={nickname} onChangeText={setNickname} />
      <Text style={styles.label}>How much do you fill it to? (ml)</Text>
      <TextInput
        style={styles.input} value={capacity} onChangeText={setCapacity}
        keyboardType="number-pad"
      />
      <Button
        title={busy ? "..." : "Link bottle & log this scan"}
        onPress={link}
        disabled={busy || !nickname.trim() || !(parseInt(capacity, 10) > 0)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 10 },
  title: { fontSize: 22, fontWeight: "600" },
  hint: { opacity: 0.7, marginBottom: 12 },
  label: { fontWeight: "600", marginTop: 8 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12, fontSize: 16 },
});
