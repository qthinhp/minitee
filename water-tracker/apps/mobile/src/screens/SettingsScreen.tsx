import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { supabase } from "../lib/supabase";
import { Chip, Field, GlowCard, NeonButton, Screen } from "../ui/components";
import { type } from "../ui/theme";

const GOALS = [1500, 2000, 2500, 3000];

export default function SettingsScreen() {
  const [goalMl, setGoalMl] = useState(2500);
  const [notifyAt, setNotifyAt] = useState("21:00");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const [{ data: profile }, { data: goal }] = await Promise.all([
        supabase.from("profiles").select("notify_at").eq("id", user.id).single(),
        supabase.from("goals").select("target_value")
          .order("effective_from", { ascending: false }).limit(1).maybeSingle(),
      ]);
      if (profile?.notify_at) setNotifyAt(profile.notify_at.slice(0, 5));
      if (goal?.target_value) setGoalMl(Math.round(goal.target_value));
    })();
  }, []);

  const save = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    if (!/^\d{2}:\d{2}$/.test(notifyAt)) return Alert.alert("Time should look like 21:00");
    setBusy(true);
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC";
    const [p, g] = await Promise.all([
      supabase.from("profiles")
        .update({ notify_at: notifyAt, timezone })
        .eq("id", user.id),
      supabase.from("goals").upsert({
        user_id: user.id,
        metric_type_id: 1, // water
        target_value: goalMl,
        effective_from: new Date().toISOString().slice(0, 10),
      }),
    ]);
    setBusy(false);
    if (p.error || g.error) return Alert.alert("Hmm", (p.error ?? g.error)!.message);
    Alert.alert("Saved! 💾", `Goal ${(goalMl / 1000).toFixed(1)}L · check-in at ${notifyAt}.`);
  };

  return (
    <Screen style={styles.container}>
      <GlowCard style={styles.card}>
        <Text style={type.label}>Daily water goal</Text>
        <View style={styles.chips}>
          {GOALS.map((ml) => (
            <Chip key={ml} label={`${(ml / 1000).toFixed(1)}L`} active={goalMl === ml}
              onPress={() => setGoalMl(ml)} />
          ))}
        </View>
        <Field
          label="Evening check-in time (we'll tell you how you did)"
          value={notifyAt} onChangeText={setNotifyAt} placeholder="21:00"
        />
        <NeonButton big title={busy ? "Saving…" : "Save"} onPress={save} disabled={busy} />
      </GlowCard>

      <View style={styles.spacer} />
      <NeonButton kind="danger" title="Sign out" onPress={() => supabase.auth.signOut()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: 24 },
  card: { gap: 14 },
  chips: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  spacer: { flex: 1 },
});
