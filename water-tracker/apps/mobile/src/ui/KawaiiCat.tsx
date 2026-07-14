// Bubbles the cat 🐱 — an original chubby kawaii mascot (inspired by the
// cozy round-cat aesthetic, drawn from scratch for this app). Pure SVG, so
// it scales crisply everywhere, plus a FloatingCat variant that bobs on a
// swim ring in the water orb.

import React, { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";
import Svg, { Circle, Ellipse, G, Path } from "react-native-svg";

export type CatMood = "sleepy" | "content" | "happy" | "excited" | "party";

const OUTLINE = "#4A3630";
const FUR = "#FFF6E9";
const PATCH = "#C8CDD6";
const BLUSH = "#FFB3C1";
const RING = "#FF8FAB";

function Eyes({ mood }: { mood: CatMood }) {
  switch (mood) {
    case "sleepy":
      // closed, drooping
      return (
        <G>
          <Path d="M33 52 Q38 56 43 52" stroke={OUTLINE} strokeWidth={2.6} fill="none" strokeLinecap="round" />
          <Path d="M57 52 Q62 56 67 52" stroke={OUTLINE} strokeWidth={2.6} fill="none" strokeLinecap="round" />
        </G>
      );
    case "happy":
      // ^ ^ arcs
      return (
        <G>
          <Path d="M33 53 Q38 47 43 53" stroke={OUTLINE} strokeWidth={2.8} fill="none" strokeLinecap="round" />
          <Path d="M57 53 Q62 47 67 53" stroke={OUTLINE} strokeWidth={2.8} fill="none" strokeLinecap="round" />
        </G>
      );
    case "excited":
      // big sparkly rounds
      return (
        <G>
          <Circle cx={38} cy={51} r={5} fill={OUTLINE} />
          <Circle cx={62} cy={51} r={5} fill={OUTLINE} />
          <Circle cx={39.8} cy={49.2} r={1.7} fill="white" />
          <Circle cx={63.8} cy={49.2} r={1.7} fill="white" />
        </G>
      );
    case "party":
      // star eyes
      return (
        <G>
          <Path d="M38 46l1.6 3.4 3.6.4-2.7 2.5.8 3.6-3.3-1.9-3.3 1.9.8-3.6-2.7-2.5 3.6-.4z" fill="#FFB020" stroke={OUTLINE} strokeWidth={1} />
          <Path d="M62 46l1.6 3.4 3.6.4-2.7 2.5.8 3.6-3.3-1.9-3.3 1.9.8-3.6-2.7-2.5 3.6-.4z" fill="#FFB020" stroke={OUTLINE} strokeWidth={1} />
        </G>
      );
    default:
      // content: calm beans
      return (
        <G>
          <Circle cx={38} cy={51.5} r={3.6} fill={OUTLINE} />
          <Circle cx={62} cy={51.5} r={3.6} fill={OUTLINE} />
          <Circle cx={39.2} cy={50.3} r={1.2} fill="white" />
          <Circle cx={63.2} cy={50.3} r={1.2} fill="white" />
        </G>
      );
  }
}

function Mouth({ mood }: { mood: CatMood }) {
  if (mood === "party" || mood === "excited") {
    return <Path d="M45 60 Q50 66 55 60 Q50 63 45 60z" fill="#E56B7F" stroke={OUTLINE} strokeWidth={1.6} />;
  }
  // the classic little ω
  return (
    <Path d="M44.5 59 Q47.5 62.5 50 59.5 Q52.5 62.5 55.5 59"
      stroke={OUTLINE} strokeWidth={2.2} fill="none" strokeLinecap="round" />
  );
}

export function KawaiiCat({ mood, size = 90 }: { mood: CatMood; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* tail curled around the side */}
      <Path d="M80 74 Q94 70 90 58 Q88 52 82 54" fill="none"
        stroke={OUTLINE} strokeWidth={7} strokeLinecap="round" />
      <Path d="M80 74 Q94 70 90 58 Q88 52 82 54" fill="none"
        stroke={FUR} strokeWidth={4} strokeLinecap="round" />

      {/* ears */}
      <Path d="M26 34 Q24 16 36 22 Q42 25 44 30z" fill={FUR} stroke={OUTLINE} strokeWidth={2.6} strokeLinejoin="round" />
      <Path d="M74 34 Q76 16 64 22 Q58 25 56 30z" fill={PATCH} stroke={OUTLINE} strokeWidth={2.6} strokeLinejoin="round" />
      <Path d="M30 30 Q29.5 22 35 25 Q38 27 39 29z" fill={BLUSH} />
      <Path d="M70 30 Q70.5 22 65 25 Q62 27 61 29z" fill={BLUSH} />

      {/* chubby blob body+head */}
      <Ellipse cx={50} cy={58} rx={33} ry={29} fill={FUR} stroke={OUTLINE} strokeWidth={2.8} />

      {/* grey patch over one eye-side, kawaii asymmetry */}
      <Path d="M56 30 Q74 30 79 46 Q80 51 78 55 Q70 44 58 42 Q54 36 56 30z" fill={PATCH} opacity={0.85} />

      {/* face */}
      <Eyes mood={mood} />
      <Mouth mood={mood} />
      <Ellipse cx={31} cy={58} rx={4.6} ry={3} fill={BLUSH} />
      <Ellipse cx={69} cy={58} rx={4.6} ry={3} fill={BLUSH} />

      {/* whiskers */}
      <Path d="M18 54h8 M18 60l8 2" stroke={OUTLINE} strokeWidth={1.6} strokeLinecap="round" />
      <Path d="M82 54h-8 M82 60l-8 2" stroke={OUTLINE} strokeWidth={1.6} strokeLinecap="round" />

      {/* front paws resting on the tummy */}
      <Ellipse cx={41} cy={83} rx={7.5} ry={5} fill={FUR} stroke={OUTLINE} strokeWidth={2.4} />
      <Ellipse cx={59} cy={83} rx={7.5} ry={5} fill={FUR} stroke={OUTLINE} strokeWidth={2.4} />
      <Path d="M39 81.5v3 M43 81.5v3 M57 81.5v3 M61 81.5v3" stroke={OUTLINE} strokeWidth={1.2} strokeLinecap="round" />

      {/* zzz when sleepy / party hat when partying */}
      {mood === "sleepy" && (
        <Path d="M74 30 h8 l-8 8 h8" stroke="#7FB8E8" strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      )}
      {mood === "party" && (
        <G>
          <Path d="M42 18 L50 2 L58 18 Q50 23 42 18z" fill="#39D6FF" stroke={OUTLINE} strokeWidth={2} strokeLinejoin="round" />
          <Circle cx={50} cy={3.5} r={3} fill="#FFB020" stroke={OUTLINE} strokeWidth={1.4} />
        </G>
      )}
    </Svg>
  );
}

/** Cat lounging in a swim ring, gently bobbing — lives on the orb's water line. */
export function FloatingCat({ mood, size = 84 }: { mood: CatMood; size?: number }) {
  const bob = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: 1, duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(bob, { toValue: 0, duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [bob]);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        transform: [
          { translateY: bob.interpolate({ inputRange: [0, 1], outputRange: [0, -7] }) },
          { rotate: bob.interpolate({ inputRange: [0, 1], outputRange: ["-4deg", "4deg"] }) },
        ],
      }}
    >
      <Svg width={size} height={size} viewBox="0 0 100 100">
        {/* swim ring behind the cat */}
        <Ellipse cx={50} cy={72} rx={38} ry={14} fill={RING} stroke={OUTLINE} strokeWidth={2.4} />
        <Ellipse cx={50} cy={70} rx={26} ry={8} fill="#0E2A4A" />
      </Svg>
      <Animated.View style={{ position: "absolute", left: size * 0.09, top: -size * 0.18 }}>
        <KawaiiCat mood={mood} size={size * 0.82} />
      </Animated.View>
      <Svg width={size} height={size} viewBox="0 0 100 100" style={{ position: "absolute" }}>
        {/* ring front lip overlaps the cat's tummy so it sits "inside" */}
        <Path d="M12 72 Q50 96 88 72 Q88 86 50 88 Q12 86 12 72z" fill={RING} stroke={OUTLINE} strokeWidth={2.4} />
        <Ellipse cx={30} cy={78} rx={6} ry={2.6} fill="white" opacity={0.55} />
        <Ellipse cx={66} cy={80} rx={7} ry={2.8} fill="white" opacity={0.55} />
      </Svg>
    </Animated.View>
  );
}
