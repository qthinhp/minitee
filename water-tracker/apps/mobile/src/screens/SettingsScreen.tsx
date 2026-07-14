import React, { useEffect, useState } from "react";
import { Alert, Button, StyleSheet, Text, TextInput, View } from "react-native";
import { supabase } from "../lib/supabase";

export default function SettingsScreen() {
  const [goalMl, setGoalMl] = useState("2500");
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
      if (goal?.target_value) setGoalMl(String(Math.round(goal.target_value)));
    })();
  }, []);

  const save = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    if (!/^\d{2}:\d{2}$/.test(notifyAt)) return Alert.alert("Time must be HH:MM");
    setBusy(true);
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC";
    const [p, g] = await Promise.all([
      supabase.from("profiles")
        .update({ notify_at: notifyAt, timezone })
        .eq("id", user.id),
      supabase.from("goals").upsert({
        user_id: user.id,
        metric_type_id: 1, // water
        target_value: parseInt(goalMl, 10),
        effective_from: new Date().toISOString().slice(0, 10),
      }),
    ]);
    setBusy(false);
    if (p.error || g.error) return Alert.alert("Error", (p.error ?? g.error)!.message);
    Alert.alert("Saved", `Goal ${goalMl}ml, summary at ${notifyAt} (${timezone}).`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Daily goal (ml)</Text>
      <TextInput style={styles.input} value={goalMl} onChangeText={setGoalMl} keyboardType="number-pad" />
      <Text style={styles.label}>Daily summary time (HH:MM, your local time)</Text>
      <TextInput style={styles.input} value={notifyAt} onChangeText={setNotifyAt} />
      <Button title={busy ? "..." : "Save"} onPress={save} disabled={busy} />
      <View style={styles.spacer} />
      <Button title="Sign out" color="#b91c1c" onPress={() => supabase.auth.signOut()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 10 },
  label: { fontWeight: "600", marginTop: 8 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12, fontSize: 16 },
  spacer: { flex: 1 },
});
