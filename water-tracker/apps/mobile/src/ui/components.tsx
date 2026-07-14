// Tiny glassy UI kit shared by every screen.

import React, { useRef } from "react";
import {
  Animated, Pressable, StyleSheet, Text, TextInput, TextInputProps,
  View, ViewProps,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { colors, radii, spacing, type } from "./theme";

/** Full-screen gradient background. Wrap every screen in this. */
export function Screen({ children, style, ...rest }: ViewProps) {
  return (
    <LinearGradient colors={[colors.bgTop, colors.bg]} style={styles.screen} {...rest}>
      <View style={[styles.screenInner, style]}>{children}</View>
    </LinearGradient>
  );
}

/** Frosted glass card with a soft aqua border. */
export function GlowCard({ children, style, ...rest }: ViewProps) {
  return (
    <View style={[styles.card, style]} {...rest}>{children}</View>
  );
}

type BtnProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  kind?: "primary" | "ghost" | "danger";
  big?: boolean;
};

/** Squishy glowing button: scales on press + light haptic tick. */
export function NeonButton({ title, onPress, disabled, kind = "primary", big }: BtnProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const squish = (to: number) =>
    Animated.spring(scale, { toValue: to, useNativeDriver: true, speed: 40, bounciness: 8 }).start();

  const press = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onPress();
  };

  const inner = (
    <Text style={[
      styles.btnText,
      big && { fontSize: 19 },
      kind === "ghost" && { color: colors.aqua },
      kind === "danger" && { color: colors.danger },
      disabled && { opacity: 0.4 },
    ]}>
      {title}
    </Text>
  );

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPressIn={() => squish(0.94)}
        onPressOut={() => squish(1)}
        onPress={press}
        disabled={disabled}
      >
        {kind === "primary" ? (
          <LinearGradient
            colors={disabled ? ["#22364f", "#22364f"] : [colors.aquaDeep, colors.aqua]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={[styles.btn, big && styles.btnBig]}
          >
            {inner}
          </LinearGradient>
        ) : (
          <View style={[styles.btn, styles.btnGhost, big && styles.btnBig,
            kind === "danger" && { borderColor: "rgba(255,123,147,0.5)" }]}>
            {inner}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

/** Pill chip (the ¾ / ½ / ¼ picker, quick-add amounts…). */
export function Chip({ label, active, onPress }: {
  label: string; active?: boolean; onPress: () => void;
}) {
  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync().catch(() => {});
        onPress();
      }}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

/** Labelled glass input. */
export function Field({ label, ...rest }: TextInputProps & { label: string }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={type.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.textDim}
        style={styles.input}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  screenInner: { flex: 1, padding: spacing(2.5), gap: spacing(2) },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing(2.5),
    gap: spacing(1),
  },
  btn: {
    paddingVertical: 14, paddingHorizontal: 22,
    borderRadius: radii.pill, alignItems: "center",
    shadowColor: colors.aqua, shadowOpacity: 0.45, shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 }, elevation: 6,
  },
  btnBig: { paddingVertical: 18, paddingHorizontal: 30 },
  btnGhost: {
    backgroundColor: "transparent", borderWidth: 1.5,
    borderColor: colors.cardBorder, shadowOpacity: 0, elevation: 0,
  },
  btnText: { color: "white", fontWeight: "700", fontSize: 16, letterSpacing: 0.5 },
  chip: {
    paddingHorizontal: 20, paddingVertical: 12, borderRadius: radii.pill,
    borderWidth: 1.5, borderColor: colors.cardBorder, backgroundColor: colors.card,
  },
  chipActive: {
    backgroundColor: colors.aquaDeep, borderColor: colors.aqua,
    shadowColor: colors.aqua, shadowOpacity: 0.6, shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 }, elevation: 6,
  },
  chipText: { color: colors.text, fontSize: 16, fontWeight: "600" },
  chipTextActive: { color: "white" },
  input: {
    borderWidth: 1.5, borderColor: colors.cardBorder, borderRadius: radii.md,
    backgroundColor: colors.card, color: colors.text,
    padding: 14, fontSize: 17,
  },
});
