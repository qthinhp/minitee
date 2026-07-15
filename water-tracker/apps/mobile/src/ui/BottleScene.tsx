// The hero: a big sticker-style water bottle (thick outlines, flat colors).
// Bubbles the cat is INSIDE — stranded at the bottom when you haven't drunk,
// floating higher with every sip, safe at the neck when you hit your goal.
// Replaces the old abstract water orb with the "save the cat" story.

import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import Svg, {
  Circle, ClipPath, Defs, Ellipse, G, Path, Rect,
} from "react-native-svg";
import { colors, mood } from "./theme";
import { AQUA, INK, PINK, TAN, TAN_DARK, CatMood } from "./KawaiiCat";

const AnimatedRect = Animated.createAnimatedComponent(Rect);
const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse);
const AnimatedG = Animated.createAnimatedComponent(G);

const W = 220;
const H = 340;

// Water surface travel inside the bottle (viewBox coords)
const SURFACE_EMPTY = 282; // puddle at the bottom
const SURFACE_FULL = 122;  // up at the shoulders — cat saved!

// Bottle interior: neck, sloped shoulders, grip waist, rounded bottom.
const BOTTLE = `
  M82 48 L82 62 C82 74 74 80 63 88 C40 104 34 120 34 142
  L34 200 C34 210 39 214 39 222 C39 230 34 234 34 244
  L34 272 C34 294 48 304 68 306 L152 306 C172 304 186 294 186 272
  L186 244 C186 234 181 230 181 222 C181 214 186 210 186 200
  L186 142 C186 120 180 104 157 88 C146 80 138 74 138 62 L138 48 Z`;

/** Cat head + paws peeking over the water line (drawn relative to y=0 = surface). */
function PeekingCat({ catMood }: { catMood: CatMood }) {
  const happy = catMood === "happy" || catMood === "excited" || catMood === "party";
  const worried = catMood === "worried" || catMood === "sleepy";
  return (
    <G>
      {/* legs dangling under water, visible through the blue like sticker art */}
      <Path d="M92 26 q0 14 8 16 M128 26 q0 14 -8 16" stroke={INK} strokeWidth={7}
        strokeLinecap="round" fill="none" opacity={0.85} />
      <Path d="M92 26 q0 14 8 16 M128 26 q0 14 -8 16" stroke={TAN} strokeWidth={3.6}
        strokeLinecap="round" fill="none" opacity={0.85} />

      {/* ears */}
      <Path d="M85 -26 L88 -44 L102 -32z" fill={TAN} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
      <Path d="M135 -26 L132 -44 L118 -32z" fill={TAN} stroke={INK} strokeWidth={3} strokeLinejoin="round" />

      {/* head above the surface */}
      <Rect x={80} y={-34} width={60} height={44} rx={20} fill={TAN} stroke={INK} strokeWidth={3.4} />
      {/* crown stripes */}
      <Path d="M104 -33 v7 M110 -34 v9 M116 -33 v7" stroke={TAN_DARK} strokeWidth={2.8} strokeLinecap="round" />

      {/* face */}
      {happy ? (
        <>
          <Path d="M92 -14 Q96.5 -19 101 -14" stroke={INK} strokeWidth={2.6} fill="none" strokeLinecap="round" />
          <Path d="M119 -14 Q123.5 -19 128 -14" stroke={INK} strokeWidth={2.6} fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <Circle cx={96.5} cy={-15} r={3} fill={INK} />
          <Circle cx={123.5} cy={-15} r={3} fill={INK} />
        </>
      )}
      {catMood === "party" || catMood === "excited" ? (
        <Ellipse cx={110} cy={-5.5} rx={3.4} ry={4} fill={PINK} stroke={INK} strokeWidth={1.6} />
      ) : worried ? (
        <Path d="M105 -6 Q108 -8.5 110 -6 Q112 -3.5 115 -6" stroke={INK} strokeWidth={2.2} fill="none" strokeLinecap="round" />
      ) : (
        <Path d="M107 -6 Q110 -4 113 -6" stroke={INK} strokeWidth={2.2} fill="none" strokeLinecap="round" />
      )}
      {catMood === "worried" && (
        <Path d="M136 -22 Q140 -16 136 -13 Q132 -16 136 -22z" fill="#8FD3F4" stroke={INK} strokeWidth={1.5} />
      )}
      {catMood === "party" && (
        <>
          <Path d="M100 -42 L110 -58 L120 -42 Q110 -37 100 -42z" fill={AQUA} stroke={INK} strokeWidth={2} strokeLinejoin="round" />
          <Circle cx={110} cy={-57} r={3} fill="#FFB020" stroke={INK} strokeWidth={1.4} />
        </>
      )}

      {/* paws hooked over the water line */}
      <Rect x={83} y={2} width={15} height={9} rx={4.5} fill={TAN} stroke={INK} strokeWidth={2.6} />
      <Rect x={122} y={2} width={15} height={9} rx={4.5} fill={TAN} stroke={INK} strokeWidth={2.6} />
    </G>
  );
}

export function BottleScene({ totalMl, goalMl }: { totalMl: number; goalMl: number | null }) {
  const goal = goalMl ?? 2500;
  const level = Math.min(1, totalMl / goal);
  const anim = useRef(new Animated.Value(level)).current;
  const bob = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(anim, { toValue: level, useNativeDriver: false, speed: 4, bounciness: 8 }).start();
  }, [level, anim]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: 1, duration: 1700, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
        Animated.timing(bob, { toValue: 0, duration: 1700, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [bob]);

  const surfaceY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [SURFACE_EMPTY, SURFACE_FULL],
  });
  const catY = Animated.add(surfaceY, bob.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }));

  const pct = goalMl ? Math.round((totalMl / goal) * 100) : 0;
  const catMood = mood(goalMl ? pct : totalMl > 0 ? 30 : 0).cat;

  return (
    <View style={styles.wrap}>
      <Svg width={W} height={H} viewBox="0 0 220 340">
        <Defs>
          <ClipPath id="bottle"><Path d={BOTTLE} /></ClipPath>
        </Defs>

        {/* bottle body */}
        <Path d={BOTTLE} fill="#FFFFFF" />

        {/* water + cat, clipped to the bottle */}
        <G clipPath="url(#bottle)">
          <AnimatedRect x={0} y={surfaceY} width={220} height={360} fill="#55A8F2" />
          {/* sparkle dots drifting with the water body */}
          <AnimatedG y={surfaceY}>
            <Circle cx={62} cy={46} r={4} fill="white" opacity={0.4} />
            <Circle cx={150} cy={78} r={5} fill="white" opacity={0.35} />
            <Circle cx={84} cy={110} r={3.4} fill="white" opacity={0.3} />
            <Circle cx={140} cy={140} r={4.4} fill="white" opacity={0.28} />
          </AnimatedG>
          {/* Bubbles rides the surface */}
          <AnimatedG y={catY}>
            <PeekingCat catMood={catMood} />
          </AnimatedG>
          {/* water surface line */}
          <AnimatedEllipse cx={110} cy={surfaceY} rx={80} ry={11}
            fill="#8FCBF8" stroke={INK} strokeWidth={3} />
        </G>

        {/* bottle outline on top */}
        <Path d={BOTTLE} fill="none" stroke={INK} strokeWidth={7} strokeLinejoin="round" />

        {/* neck lip + cap */}
        <Rect x={74} y={38} width={72} height={11} rx={5.5} fill="white" stroke={INK} strokeWidth={5} />
        <Rect x={68} y={6} width={84} height={34} rx={10} fill={AQUA} stroke={INK} strokeWidth={6} />
        <Path d="M84 13 v20 M97 13 v20 M110 13 v20 M123 13 v20 M136 13 v20"
          stroke={INK} strokeWidth={4} strokeLinecap="round" opacity={0.85} />
      </Svg>

      <View style={styles.readout}>
        <Text style={styles.liters}>{(totalMl / 1000).toFixed(2)}L</Text>
        <Text style={styles.pct}>
          {goalMl
            ? pct >= 100 ? "goal reached — Bubbles is saved! 🎉" : `${pct}% of the way to saving Bubbles`
            : "set a goal in Settings to start the rescue"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", gap: 4 },
  readout: { alignItems: "center", gap: 2 },
  liters: { fontSize: 40, fontWeight: "800", color: colors.text, letterSpacing: 1 },
  pct: { fontSize: 14, color: colors.textDim },
});
