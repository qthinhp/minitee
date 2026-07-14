import React, { useState } from "react";
import { Button, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { adjustScan, removeScan } from "../lib/queue";
import type { RootStackParamList } from "../lib/scanHandler";

type Props = NativeStackScreenProps<RootStackParamList, "ScanConfirm">;

// The scan is ALREADY logged (full bottle) before this screen appears — the
// fast path stays one-tap. These chips just correct it for the real world.
const FRACTIONS = [
  { label: "Full", f: 1 },
  { label: "¾", f: 0.75 },
  { label: "½", f: 0.5 },
  { label: "¼", f: 0.25 },
] as const;

export default function ScanConfirmScreen({ route, navigation }: Props) {
  const { clientEventId, nickname, capacityMl } = route.params;
  const [selected, setSelected] = useState(1);

  const pick = async (f: number) => {
    setSelected(f);
    await adjustScan(clientEventId, Math.round(capacityMl * f));
  };

  const undo = async () => {
    await removeScan(clientEventId);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.check}>💧✓</Text>
      <Text style={styles.title}>
        +{Math.round(capacityMl * selected)}ml from {nickname}
      </Text>
      <Text style={styles.hint}>How much did you actually drink?</Text>
      <View style={styles.chips}>
        {FRACTIONS.map(({ label, f }) => (
          <TouchableOpacity
            key={label}
            style={[styles.chip, selected === f && styles.chipActive]}
            onPress={() => pick(f)}
          >
            <Text style={selected === f ? styles.chipTextActive : undefined}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Button title="Done" onPress={() => navigation.goBack()} />
      <TouchableOpacity onPress={undo}>
        <Text style={styles.undo}>Accidental scan? Undo</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 16 },
  check: { fontSize: 64 },
  title: { fontSize: 22, fontWeight: "600" },
  hint: { opacity: 0.7 },
  chips: { flexDirection: "row", gap: 10 },
  chip: {
    paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20,
    borderWidth: 1, borderColor: "#2f80ed",
  },
  chipActive: { backgroundColor: "#2f80ed" },
  chipTextActive: { color: "white", fontWeight: "600" },
  undo: { color: "#b91c1c", marginTop: 8 },
});
