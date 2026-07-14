// The centerpiece: a glowing glass orb that fills with animated water as you
// drink. Waves slosh side to side, bubbles rise, and the fill level springs
// to the new height on every log. Built on the core Animated API + SVG —
// no extra animation runtime needed.

import React, { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "./theme";

const ORB = 260;          // orb diameter
const WAVE_H = 18;        // wave amplitude band

function wavePath(width: number, amp: number): string {
  // Two full sine-ish periods so a 50% translate loops seamlessly.
  const half = width / 2;
  return [
    `M0 ${amp}`,
    `Q ${half * 0.25} 0, ${half * 0.5} ${amp}`,
    `T ${half} ${amp}`,
    `T ${half * 1.5} ${amp}`,
    `T ${width} ${amp}`,
    `V ${amp * 2 + ORB} H0 Z`,
  ].join(" ");
}

function Wave({ speedMs, opacity }: { speedMs: number; opacity: number }) {
  const x = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(x, {
        toValue: 1, duration: speedMs, easing: Easing.linear, useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [speedMs, x]);

  const translateX = x.interpolate({ inputRange: [0, 1], outputRange: [0, -ORB] });
  return (
    <Animated.View style={{ position: "absolute", top: -WAVE_H, left: 0, width: ORB * 2,
      transform: [{ translateX }], opacity }}>
      <Svg width={ORB * 2} height={WAVE_H * 2 + ORB}>
        <Path d={wavePath(ORB * 2, WAVE_H)} fill={colors.waterBottom} />
      </Svg>
    </Animated.View>
  );
}

function Bubble({ delay, left, size }: { delay: number; left: number; size: number }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(t, {
          toValue: 1, duration: 2600, easing: Easing.out(Easing.quad), useNativeDriver: true,
        }),
        Animated.timing(t, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [delay, t]);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute", bottom: 10, left,
        width: size, height: size, borderRadius: size,
        backgroundColor: "rgba(255,255,255,0.35)",
        opacity: t.interpolate({ inputRange: [0, 0.15, 0.8, 1], outputRange: [0, 0.8, 0.5, 0] }),
        transform: [
          { translateY: t.interpolate({ inputRange: [0, 1], outputRange: [0, -ORB * 0.75] }) },
          { translateX: t.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 6, -4] }) },
        ],
      }}
    />
  );
}

export function WaterOrb({ totalMl, goalMl }: { totalMl: number; goalMl: number | null }) {
  const pct = goalMl ? Math.min(1, totalMl / goalMl) : Math.min(1, totalMl / 2500);
  const level = useRef(new Animated.Value(pct)).current;

  useEffect(() => {
    Animated.spring(level, { toValue: pct, useNativeDriver: false, speed: 4, bounciness: 10 }).start();
  }, [pct, level]);

  // Water surface position: 8%..96% of the orb so it always looks alive.
  const waterTop = level.interpolate({
    inputRange: [0, 1],
    outputRange: [ORB * 0.92, ORB * 0.06],
  });

  const bubbles = useMemo(
    () => [
      { delay: 0, left: ORB * 0.3, size: 8 },
      { delay: 900, left: ORB * 0.55, size: 12 },
      { delay: 1700, left: ORB * 0.42, size: 6 },
      { delay: 2300, left: ORB * 0.68, size: 9 },
    ],
    [],
  );

  return (
    <View style={styles.wrap}>
      <View style={styles.halo} />
      <View style={styles.orb}>
        {/* Water body: everything below the animated surface line */}
        <Animated.View style={[StyleSheet.absoluteFill, { top: waterTop }]}>
          <LinearGradient
            colors={[colors.waterBottom, colors.waterTop]}
            style={StyleSheet.absoluteFill}
          />
          <Wave speedMs={5200} opacity={1} />
          <Wave speedMs={8200} opacity={0.45} />
          {bubbles.map((b, i) => <Bubble key={i} {...b} />)}
        </Animated.View>

        {/* Readout floats over the water */}
        <View style={styles.readout} pointerEvents="none">
          <Text style={styles.liters}>{(totalMl / 1000).toFixed(2)}</Text>
          <Text style={styles.unit}>litres today</Text>
          <Text style={styles.pct}>
            {goalMl ? `${Math.round((totalMl / goalMl) * 100)}% of goal` : "set a goal in Settings"}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center" },
  halo: {
    position: "absolute", width: ORB + 26, height: ORB + 26, borderRadius: (ORB + 26) / 2,
    backgroundColor: "transparent",
    borderWidth: 2, borderColor: "rgba(57,214,255,0.25)",
    shadowColor: colors.aqua, shadowOpacity: 0.8, shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 }, elevation: 12,
  },
  orb: {
    width: ORB, height: ORB, borderRadius: ORB / 2, overflow: "hidden",
    backgroundColor: "rgba(120,190,255,0.07)",
    borderWidth: 1.5, borderColor: colors.cardBorder,
    alignItems: "center", justifyContent: "center",
  },
  readout: { alignItems: "center" },
  liters: {
    fontSize: 62, fontWeight: "800", color: "white", letterSpacing: 1,
    textShadowColor: "rgba(5,11,24,0.6)", textShadowRadius: 12, textShadowOffset: { width: 0, height: 2 },
  },
  unit: { fontSize: 15, color: "rgba(255,255,255,0.85)", marginTop: -6, letterSpacing: 2,
    textTransform: "uppercase", fontWeight: "600" },
  pct: { fontSize: 14, color: "rgba(255,255,255,0.75)", marginTop: 6 },
});
