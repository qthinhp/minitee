import React, { useCallback, useState } from "react";
import {
  Button, FlatList, StyleSheet, Text, TouchableOpacity, View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as Crypto from "expo-crypto";

import { EventRow, supabase } from "../lib/supabase";
import { flushQueue, pendingCount } from "../lib/queue";
import { rescheduleNudge } from "../lib/notifications";
import { handleScan, RootStackParamList } from "../lib/scanHandler";
import { NFC_MOCK_MODE, readTag } from "../lib/nfc";

type Props = NativeStackScreenProps<RootStackParamList, "Today">;

export default function TodayScreen({ navigation }: Props) {
  const [total, setTotal] = useState(0);
  const [goal, setGoal] = useState<number | null>(null);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [pending, setPending] = useState(0);

  const refresh = useCallback(async () => {
    await flushQueue();
    const [{ data: summary }, { data: rows }] = await Promise.all([
      supabase.rpc("today_summary"),
      supabase.from("events").select("*")
        .gte("occurred_at", new Date(Date.now() - 36 * 3600e3).toISOString())
        .order("occurred_at", { ascending: false }).limit(30),
    ]);
    if (summary?.[0]) {
      setTotal(Number(summary[0].total));
      setGoal(summary[0].goal !== null ? Number(summary[0].goal) : null);
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
    } catch (e) {
      // cancelled or unreadable tag — no-op
    }
  };

  const pct = goal ? Math.min(100, Math.round((total / goal) * 100)) : null;

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.total}>{(total / 1000).toFixed(2)}L</Text>
        <Text style={styles.goal}>
          {goal ? `of ${(goal / 1000).toFixed(1)}L goal (${pct}%)` : "no goal set — see Settings"}
        </Text>
        {goal != null && (
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: `${pct}%` }]} />
          </View>
        )}
        {pending > 0 && <Text style={styles.pending}>{pending} scan(s) waiting to sync</Text>}
      </View>

      <View style={styles.row}>
        <Button title="Scan bottle" onPress={scanInApp} />
        <Button title="+250ml" onPress={() => manualAdd(250)} />
        <Button title="+500ml" onPress={() => manualAdd(500)} />
      </View>

      {(__DEV__ || NFC_MOCK_MODE) && (
        <TouchableOpacity style={styles.devBtn} onPress={() => handleScan("mock01", "nfc")}>
          <Text style={styles.devBtnText}>
            🧪 Simulate sticker scan (bottle "mock01")
          </Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={events}
        keyExtractor={(e) => e.id}
        style={styles.list}
        renderItem={({ item }) => (
          <View style={styles.eventRow}>
            <Text>{item.source === "manual" ? "✍️" : "📡"} {item.value}ml</Text>
            <Text style={styles.time}>
              {new Date(item.occurred_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Nothing logged yet today.</Text>}
      />

      <View style={styles.row}>
        <Button title="Register sticker" onPress={() => navigation.navigate("RegisterBottle")} />
        <Button title="Settings" onPress={() => navigation.navigate("Settings")} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 16 },
  hero: { alignItems: "center", gap: 6, paddingVertical: 16 },
  total: { fontSize: 56, fontWeight: "700" },
  goal: { fontSize: 16, opacity: 0.7 },
  barTrack: { width: "100%", height: 12, borderRadius: 6, backgroundColor: "#e0e7ef", marginTop: 8 },
  barFill: { height: 12, borderRadius: 6, backgroundColor: "#2f80ed" },
  pending: { fontSize: 12, color: "#b45309", marginTop: 4 },
  row: { flexDirection: "row", justifyContent: "space-evenly" },
  devBtn: { backgroundColor: "#fef3c7", padding: 10, borderRadius: 8 },
  devBtnText: { textAlign: "center" },
  list: { flex: 1 },
  eventRow: {
    flexDirection: "row", justifyContent: "space-between",
    paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: "#ddd",
  },
  time: { opacity: 0.6 },
  empty: { textAlign: "center", opacity: 0.5, marginTop: 24 },
});
