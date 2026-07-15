// Bubbles the cat 🐱 — original chubby tan cat drawn from scratch as SVG:
// thick sticker outlines, flat colors, tiny ears, tabby stripes. Story: she
// lives in your water bottle, and drinking enough water floats her to safety.

import React from "react";
import Svg, { Circle, Ellipse, G, Path, Rect } from "react-native-svg";

export type CatMood = "worried" | "sleepy" | "content" | "happy" | "excited" | "party";

export const INK = "#1F1B16";      // thick outline
export const TAN = "#F6C583";      // fur
export const TAN_DARK = "#DBA55E"; // stripes
export const PINK = "#F08AA0";     // mouth
export const AQUA = "#5BD1DB";     // bottle cap / accents

function Eyes({ mood }: { mood: CatMood }) {
  switch (mood) {
    case "worried":
    case "content":
      return (
        <G>
          <Circle cx={40} cy={50.5} r={3.4} fill={INK} />
          <Circle cx={62} cy={50.5} r={3.4} fill={INK} />
        </G>
      );
    case "sleepy":
      return (
        <G>
          <Path d="M35 51 Q40 55 45 51" stroke={INK} strokeWidth={2.6} fill="none" strokeLinecap="round" />
          <Path d="M57 51 Q62 55 67 51" stroke={INK} strokeWidth={2.6} fill="none" strokeLinecap="round" />
        </G>
      );
    case "happy":
      return (
        <G>
          <Path d="M35 52 Q40 46 45 52" stroke={INK} strokeWidth={2.8} fill="none" strokeLinecap="round" />
          <Path d="M57 52 Q62 46 67 52" stroke={INK} strokeWidth={2.8} fill="none" strokeLinecap="round" />
        </G>
      );
    case "excited":
      return (
        <G>
          <Circle cx={40} cy={50} r={4.4} fill={INK} />
          <Circle cx={62} cy={50} r={4.4} fill={INK} />
          <Circle cx={41.6} cy={48.4} r={1.5} fill="white" />
          <Circle cx={63.6} cy={48.4} r={1.5} fill="white" />
        </G>
      );
    case "party":
      return (
        <G>
          <Path d="M40 45l1.6 3.4 3.6.4-2.7 2.5.8 3.6-3.3-1.9-3.3 1.9.8-3.6-2.7-2.5 3.6-.4z" fill="#FFB020" stroke={INK} strokeWidth={1} />
          <Path d="M62 45l1.6 3.4 3.6.4-2.7 2.5.8 3.6-3.3-1.9-3.3 1.9.8-3.6-2.7-2.5 3.6-.4z" fill="#FFB020" stroke={INK} strokeWidth={1} />
        </G>
      );
  }
}

function Mouth({ mood }: { mood: CatMood }) {
  if (mood === "excited" || mood === "party") {
    return <Path d="M46 58 Q51 65 56 58 Q51 61 46 58z" fill={PINK} stroke={INK} strokeWidth={1.8} />;
  }
  if (mood === "worried") {
    return <Path d="M46 60 Q49 57.5 51 60 Q53 62.5 56 60" stroke={INK} strokeWidth={2.4} fill="none" strokeLinecap="round" />;
  }
  return <Path d="M48 59 Q51 61.5 54 59" stroke={INK} strokeWidth={2.2} fill="none" strokeLinecap="round" />;
}

function Extras({ mood }: { mood: CatMood }) {
  if (mood === "worried") {
    // sweat drop
    return <Path d="M72 40 Q76 46 72 49 Q68 46 72 40z" fill="#8FD3F4" stroke={INK} strokeWidth={1.6} />;
  }
  if (mood === "sleepy") {
    return <Path d="M74 34 h8 l-8 8 h8" stroke="#8FD3F4" strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
  }
  if (mood === "party") {
    return (
      <G>
        <Path d="M42 20 L51 4 L60 20 Q51 25 42 20z" fill={AQUA} stroke={INK} strokeWidth={2} strokeLinejoin="round" />
        <Circle cx={51} cy={5} r={3} fill="#FFB020" stroke={INK} strokeWidth={1.4} />
      </G>
    );
  }
  if (mood === "excited") {
    return <Path d="M24 32l1.2 2.6 2.8.3-2.1 1.9.6 2.8-2.5-1.5-2.5 1.5.6-2.8-2.1-1.9 2.8-.3z" fill="#FFD66B" />;
  }
  return null;
}

/** Full-body Bubbles: chunky rounded-square blob with tabby stripes. */
export function KawaiiCat({ mood, size = 90 }: { mood: CatMood; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* tail curling out the right side, with stripes */}
      <Path d="M82 76 Q97 74 94 60 Q93 54 87 55" fill="none" stroke={INK} strokeWidth={9} strokeLinecap="round" />
      <Path d="M82 76 Q97 74 94 60 Q93 54 87 55" fill="none" stroke={TAN} strokeWidth={5} strokeLinecap="round" />
      <Path d="M92 70 l5 -1 M93 63 l5 -1.5" stroke={INK} strokeWidth={2} strokeLinecap="round" />

      {/* ears: little triangles on the blob's top corners */}
      <Path d="M27 36 L31 18 L45 29z" fill={TAN} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
      <Path d="M75 36 L71 18 L57 29z" fill={TAN} stroke={INK} strokeWidth={3} strokeLinejoin="round" />

      {/* chunky rounded-square body */}
      <Rect x={20} y={26} width={62} height={64} rx={26} fill={TAN} stroke={INK} strokeWidth={3.4} />

      {/* tabby stripes: crown + cheek */}
      <Path d="M45 27 v8 M51 26 v10 M57 27 v8" stroke={TAN_DARK} strokeWidth={3} strokeLinecap="round" />
      <Path d="M22 56 l7 2 M22 63 l7 1" stroke={TAN_DARK} strokeWidth={2.6} strokeLinecap="round" />

      {/* face */}
      <Eyes mood={mood} />
      <Mouth mood={mood} />

      {/* stubby feet */}
      <Path d="M34 89 q3 5 8 0 M58 89 q3 5 8 0" stroke={INK} strokeWidth={3} fill={TAN} strokeLinecap="round" />

      <Extras mood={mood} />
    </Svg>
  );
}

/** Bubbles chugging from her bottle — the scan-confirmation hero pose. */
export function DrinkingCat({ size = 120 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 110 100">
      {/* raised arm holding the bottle */}
      <Path d="M62 46 Q72 30 84 26" stroke={INK} strokeWidth={9} strokeLinecap="round" />
      <Path d="M62 46 Q72 30 84 26" stroke={TAN} strokeWidth={5} strokeLinecap="round" />

      {/* tilted bottle at the mouth */}
      <G rotation={32} origin="76, 26">
        <Rect x={62} y={18} width={30} height={15} rx={5} fill="#7FC8F5" stroke={INK} strokeWidth={3} />
        <Rect x={88} y={17.4} width={8} height={16.4} rx={3} fill="white" stroke={INK} strokeWidth={3} />
        <Path d="M67 23 l5 -2 M67 28 l5 -2" stroke="white" strokeWidth={2} strokeLinecap="round" />
      </G>
      {/* water stream into the mouth */}
      <Path d="M60 34 Q56 40 53 45" stroke="#7FC8F5" strokeWidth={6} strokeLinecap="round" />

      {/* ears */}
      <Path d="M22 34 L26 16 L40 27z" fill={TAN} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
      <Path d="M66 30 L64 14 L50 24z" fill={TAN} stroke={INK} strokeWidth={3} strokeLinejoin="round" />

      {/* tilted-back chunky body */}
      <Rect x={14} y={24} width={60} height={66} rx={26} fill={TAN} stroke={INK} strokeWidth={3.4}
        transform="rotate(-8 44 57)" />

      {/* crown stripes */}
      <Path d="M38 24 l1 8 M45 22.5 l1.5 9 M52 22.5 l1 8" stroke={TAN_DARK} strokeWidth={3} strokeLinecap="round" />

      {/* face mid-glug: closed blissful eye + open mouth catching the stream */}
      <Circle cx={30} cy={46} r={3.2} fill={INK} />
      <Ellipse cx={51} cy={47} rx={5.5} ry={6.5} fill={INK} />
      <Ellipse cx={51} cy={49} rx={3} ry={3.4} fill={PINK} />

      {/* cheek stripes + stubby feet */}
      <Path d="M16 60 l7 2 M16 67 l7 1" stroke={TAN_DARK} strokeWidth={2.6} strokeLinecap="round" />
      <Path d="M28 90 q3 5 8 0 M50 92 q3 5 8 0" stroke={INK} strokeWidth={3} fill={TAN} strokeLinecap="round" />
    </Svg>
  );
}
