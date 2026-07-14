// Emoji-burst overlay for the moment you hit your daily goal.
// Mount with a changing `burstKey` to re-fire; renders nothing when idle.

import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, Easing, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";

const EMOJI = ["💧", "🎉", "✨", "🐾", "🌊", "⭐", "🐟", "🎊", "💦", "🏆", "🐾", "💧"];

function Particle({ emoji, index, total }: { emoji: string; index: number; total: number }) {
  const t = useRef(new Animated.Value(0)).current;
  const { width, height } = Dimensions.get("window");
  const angle = (index / total) * Math.PI * 2 + 0.4;
  const dist = 120 + (index % 3) * 70;

  useEffect(() => {
    Animated.timing(t, {
      toValue: 1, duration: 1400, easing: Easing.out(Easing.cubic), useNativeDriver: true,
    }).start();
  }, [t]);

  return (
    <Animated.Text
      style={{
        position: "absolute", left: width / 2 - 14, top: height * 0.32, fontSize: 28,
        opacity: t.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 1, 0] }),
        transform: [
          { translateX: t.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(angle) * dist] }) },
          { translateY: t.interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(angle) * dist + 80] }) },
          { scale: t.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0.4, 1.3, 0.9] }) },
          { rotate: t.interpolate({ inputRange: [0, 1], outputRange: ["0deg", `${(index % 2 ? 1 : -1) * 180}deg`] }) },
        ],
      }}
    >
      {emoji}
    </Animated.Text>
  );
}

export function Celebration({ burstKey }: { burstKey: number }) {
  useEffect(() => {
    if (burstKey > 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
  }, [burstKey]);

  if (burstKey <= 0) return null;
  return (
    <Animated.View key={burstKey} pointerEvents="none" style={StyleSheet.absoluteFill}>
      {EMOJI.map((e, i) => <Particle key={i} emoji={e} index={i} total={EMOJI.length} />)}
    </Animated.View>
  );
}
