import React, { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { supabase } from "../lib/supabase";
import { Field, GlowCard, NeonButton, Screen } from "../ui/components";
import { KawaiiCat } from "../ui/KawaiiCat";
import { colors, type } from "../ui/theme";

// Email code sign-in: no passwords to remember — friendly for everyone.
// Swap in Sign in with Apple/Google before shipping (Supabase config change).
export default function AuthScreen() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const sendCode = async () => {
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({ email: email.trim() });
    setBusy(false);
    if (error) return Alert.alert("Hmm", error.message);
    setSent(true);
  };

  const verify = async () => {
    setBusy(true);
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim(), token: code.trim(), type: "email",
    });
    setBusy(false);
    if (error) Alert.alert("That code didn't work", "Double-check your email and try again!");
  };

  return (
    <Screen style={styles.container}>
      <View style={styles.logoRow}>
        <KawaiiCat mood="happy" size={110} />
        <Text style={styles.logo}>💧</Text>
      </View>
      <Text style={[type.title, styles.center]}>Water Tracker</Text>
      <Text style={[type.dim, styles.center]}>
        Tap your bottle. Stay hydrated. That's the whole app.
      </Text>

      <GlowCard style={styles.card}>
        <Field
          label="Your email"
          placeholder="you@example.com"
          value={email} onChangeText={setEmail}
          autoCapitalize="none" keyboardType="email-address" editable={!sent}
        />
        {sent && (
          <Field
            label="Magic code (check your inbox ✉️)"
            placeholder="123456"
            value={code} onChangeText={setCode} keyboardType="number-pad"
          />
        )}
        <NeonButton
          big
          title={busy ? "One sec…" : sent ? "Let me in ✨" : "Send me a magic code"}
          onPress={sent ? verify : sendCode}
          disabled={busy || !email.includes("@") || (sent && code.length < 6)}
        />
        {sent && (
          <Text style={styles.resend} onPress={sendCode}>
            Didn't get it? Send another
          </Text>
        )}
      </GlowCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { justifyContent: "center", gap: 10 },
  logoRow: { flexDirection: "row", justifyContent: "center", alignItems: "flex-end" },
  logo: { fontSize: 40, marginLeft: -16, marginBottom: 10 },
  center: { textAlign: "center" },
  card: { marginTop: 18, gap: 16 },
  resend: { color: colors.aqua, textAlign: "center", fontSize: 14 },
});
