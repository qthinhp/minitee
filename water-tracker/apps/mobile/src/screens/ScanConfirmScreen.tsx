import React, { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as Haptics from "expo-haptics";

import { adjustScan, removeScan } from "../lib/queue";
import type { RootStackParamList } from "../lib/scanHandler";
import { Chip, NeonButton, Screen } from "../ui/components";
import { KawaiiCat } from "../ui/KawaiiCat";
import { colors, type } from "../ui/theme";

type Props = NativeStackScreenProps<RootStackParamList, "ScanConfirm">;

// The sip is ALREADY saved (full bottle) before this screen appears — the
// fast path stays one-tap. These chips just correct it for the real world.
const FRACTIONS = [
  { label: "Full bottle", f: 1 },
  { label: "¾", f: 0.75 },
  { label: "½", f: 0.5 },
  { label: "¼", f: 0.25 },
] as const;

export default function ScanConfirmScreen({ route, navigation }: Props) {
  const { clientEventId, nickname, capacityMl } = route.params;
  const [selected, setSelected] = useState(1);
  const drop = useRef(new Animated.Value(0)).current;

  // Big happy drop bounces in + success haptic.
  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    Animated.spring(drop, { toValue: 1, useNativeDriver: true, speed: 6, bounciness: 16 }).start();
  }, [drop]);

  const pick = async (f: number) => {
    setSelected(f);
    await adjustScan(clientEventId, Math.round(capacityMl * f));
  };

  const undo = async () => {
    await removeScan(clientEventId);
    navigation.goBack();
  };

  return (
    <Screen style={styles.container}>
      <Animated.View
        style={{
          opacity: drop,
          transform: [
            { scale: drop.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }) },
            { translateY: drop.interpolate({ inputRange: [0, 1], outputRange: [-60, 0] }) },
          ],
        }}
      >
        <View style={styles.catRow}>
          <KawaiiCat mood="excited" size={110} />
          <Text style={styles.drop}>💧</Text>
        </View>
      </Animated.View>
      <Text style={styles.glug}>glug glug glug…</Text>
      <Text style={[type.hero, styles.amount]}>+{Math.round(capacityMl * selected)}ml</Text>
      <Text style={type.dim}>from {nickname} — nice one! 🎉</Text>

      <Text style={[type.label, styles.question]}>Drank less than a full bottle?</Text>
      <View style={styles.chips}>
        {FRACTIONS.map(({ label, f }) => (
          <Chip key={label} label={label} active={selected === f} onPress={() => pick(f)} />
        ))}
      </View>

      <NeonButton big title="Done ✓" onPress={() => navigation.goBack()} />
      <TouchableOpacity onPress={undo}>
        <Text style={styles.undo}>Oops, accidental tap — undo</Text>
      </TouchableOpacity>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center", gap: 14 },
  catRow: { flexDirection: "row", alignItems: "flex-end" },
  drop: { fontSize: 40, marginLeft: -14, marginBottom: 8 },
  glug: { color: colors.aqua, fontSize: 15, letterSpacing: 3, textTransform: "uppercase" },
  amount: { marginTop: -6 },
  question: { marginTop: 16 },
  chips: { flexDirection: "row", gap: 8, flexWrap: "wrap", justifyContent: "center" },
  undo: { color: colors.danger, marginTop: 10, fontSize: 15 },
});
