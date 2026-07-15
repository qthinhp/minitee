import React, { useCallback, useRef, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as Crypto from "expo-crypto";

import { EventRow, supabase } from "../lib/supabase";
import { flushQueue, pendingCount } from "../lib/queue";
import { rescheduleNudge } from "../lib/notifications";
import { handleScan, RootStackParamList } from "../lib/scanHandler";
import { NFC_MOCK_MODE, readTag } from "../lib/nfc";
import { syncWidgets } from "../widgets/widget-sync";
import { Chip, GlowCard, NeonButton, Screen } from "../ui/components";
import { KawaiiCat } from "../ui/KawaiiCat";
import { BottleScene } from "../ui/BottleScene";
import { Celebration } from "../ui/Celebration";
import { colors, mood, type } from "../ui/theme";

type Props = NativeStackScreenProps<RootStackParamList, "Today">;

export default function TodayScreen({ navigation }: Props) {
  const [total, setTotal] = useState(0);
  const [goal, setGoal] = useState<number | null>(null);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [pending, setPending] = useState(0);
  const [burstKey, setBurstKey] = useState(0);
  const prevTotal = useRef(0);

  const refresh = useCallback(async () => {
    await flushQueue();
    const [{ data: summary }, { data: rows }] = await Promise.all([
      supabase.rpc("today_summary"),
      supabase.from("events").select("*")
        .gte("occurred_at", new Date(Date.now() - 36 * 3600e3).toISOString())
        .order("occurred_at", { ascending: false }).limit(30),
    ]);
    if (summary?.[0]) {
      const newTotal = Number(summary[0].total);
      const newGoal = summary[0].goal !== null ? Number(summary[0].goal) : null;
      // Crossed the goal line since last look? Party time.
      if (newGoal && prevTotal.current < newGoal && newTotal >= newGoal) {
        setBurstKey((k) => k + 1);
      }
      prevTotal.current = newTotal;
      setTotal(newTotal);
      setGoal(newGoal);
      void syncWidgets(newTotal, newGoal);
    }
    setEvents((rows as EventRow[]) ?? []);
    setPending(await pendingCount());
  }, []);

  useFocusEffect(useCallback(() => { void refresh(); }, [refresh]));

  const manualAdd = async (ml: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("events").insert({
      user_id: user.id,
      metric_type_id: 1, // water (seeded first)
      value: ml,
      source: "manual",
      client_event_id: Crypto.randomUUID(),
    });
    void rescheduleNudge();
    void refresh();
  };

  const scanInApp = async () => {
    try {
      const { shortCode } = await readTag();
      await handleScan(shortCode, "nfc");
    } catch {
      // cancelled or unreadable tag — no-op
    }
  };

  const pct = goal ? Math.round((total / goal) * 100) : 0;
  const drippy = mood(goal ? pct : total > 0 ? 30 : 0);

  return (
    <Screen>
      <FlatList
        data={events}
        keyExtractor={(e) => e.id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <BottleScene totalMl={total} goalMl={goal} />

            <GlowCard style={styles.mascotCard}>
              <KawaiiCat mood={drippy.cat} size={58} />
              <Text style={[type.body, styles.mascotLine]}>{drippy.line}</Text>
            </GlowCard>

            {pending > 0 && (
              <Text style={styles.pending}>
                📶 {pending} sip{pending > 1 ? "s" : ""} saved — will sync when you're online
              </Text>
            )}

            <NeonButton big title="📡  Scan my bottle" onPress={scanInApp} />

            <View style={styles.chipRow}>
              <Chip label="+ Glass 250" onPress={() => manualAdd(250)} />
              <Chip label="+ Bottle 500" onPress={() => manualAdd(500)} />
              <Chip label="+ Big 750" onPress={() => manualAdd(750)} />
            </View>

            {(__DEV__ || NFC_MOCK_MODE) && (
              <TouchableOpacity style={styles.devBtn} onPress={() => handleScan("mock01", "nfc")}>
                <Text style={styles.devBtnText}>🧪 Pretend I tapped a sticker</Text>
              </TouchableOpacity>
            )}

            <Text style={[type.label, styles.listTitle]}>Today's sips</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.eventRow}>
            <Text style={type.body}>
              {item.source === "manual" ? "✍️" : "📡"}  {item.value}ml
            </Text>
            <Text style={type.dim}>
              {new Date(item.occurred_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={[type.dim, styles.empty]}>No sips yet — your bottle misses you 🥺</Text>
        }
        ListFooterComponent={
          <View style={styles.footer}>
            <NeonButton kind="ghost" title="✨ New sticker" onPress={() => navigation.navigate("RegisterBottle")} />
            <NeonButton kind="ghost" title="⚙️ Settings" onPress={() => navigation.navigate("Settings")} />
          </View>
        }
      />
      <Celebration burstKey={burstKey} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: 16, paddingTop: 8, paddingBottom: 4, alignItems: "stretch" },
  mascotCard: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 },
  mascotLine: { flex: 1 },
  pending: { color: colors.gold, textAlign: "center", fontSize: 13 },
  chipRow: { flexDirection: "row", justifyContent: "center", gap: 10, flexWrap: "wrap" },
  devBtn: {
    backgroundColor: "rgba(255,214,107,0.12)", borderColor: "rgba(255,214,107,0.4)",
    borderWidth: 1, padding: 10, borderRadius: 14,
  },
  devBtnText: { textAlign: "center", color: colors.gold },
  listTitle: { marginTop: 8 },
  eventRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.cardBorder,
  },
  empty: { textAlign: "center", marginVertical: 24 },
  footer: { flexDirection: "row", justifyContent: "space-evenly", marginVertical: 20 },
});
