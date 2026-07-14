import React, { useState } from "react";
import { Alert, Button, StyleSheet, Text, TextInput, View } from "react-native";
import { supabase } from "../lib/supabase";

// Email OTP keeps the scaffold dependency-free; swap in Sign in with
// Apple/Google before shipping (both are ~1 config change in Supabase Auth).
export default function AuthScreen() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const sendCode = async () => {
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({ email: email.trim() });
    setBusy(false);
    if (error) return Alert.alert("Error", error.message);
    setSent(true);
  };

  const verify = async () => {
    setBusy(true);
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim(), token: code.trim(), type: "email",
    });
    setBusy(false);
    if (error) Alert.alert("Error", error.message);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>💧</Text>
      <Text style={styles.subtitle}>Scan your bottle. Stay hydrated.</Text>
      <TextInput
        style={styles.input} placeholder="you@example.com" value={email}
        onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address"
        editable={!sent}
      />
      {sent && (
        <TextInput
          style={styles.input} placeholder="6-digit code from your email"
          value={code} onChangeText={setCode} keyboardType="number-pad"
        />
      )}
      <Button
        title={busy ? "..." : sent ? "Verify code" : "Send sign-in code"}
        onPress={sent ? verify : sendCode}
        disabled={busy || !email.includes("@") || (sent && code.length < 6)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, gap: 12 },
  title: { fontSize: 64, textAlign: "center" },
  subtitle: { fontSize: 16, textAlign: "center", marginBottom: 24, opacity: 0.7 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12, fontSize: 16 },
});
