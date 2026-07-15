// Android home-screen widget (rendered to RemoteViews by
// react-native-android-widget — only FlexWidget/TextWidget primitives here).
// Tapping it opens the app.

import React from "react";
import { FlexWidget, TextWidget } from "react-native-android-widget";

const SEGMENTS = 8;

export function HydrationWidget({ totalMl, goalMl }: { totalMl: number; goalMl: number | null }) {
  const goal = goalMl ?? 2500;
  const pct = Math.min(1, totalMl / goal);
  const filled = Math.round(pct * SEGMENTS);
  const bar = "●".repeat(filled) + "○".repeat(SEGMENTS - filled);
  const face = pct >= 1 ? "🏆" : pct >= 0.75 ? "🤩" : pct >= 0.5 ? "😄" : pct >= 0.25 ? "🙂" : "💧";

  return (
    <FlexWidget
      clickAction="OPEN_APP"
      style={{
        height: "match_parent",
        width: "match_parent",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#0B1B33",
        borderRadius: 24,
        padding: 12,
      }}
    >
      <TextWidget
        text={`${face}  ${(totalMl / 1000).toFixed(1)}L`}
        style={{ fontSize: 28, color: "#EAF6FF", fontWeight: "bold" }}
      />
      <TextWidget
        text={goalMl ? `of ${(goal / 1000).toFixed(1)}L goal` : "tap to set a goal"}
        style={{ fontSize: 13, color: "#9FC5E8", marginTop: 2 }}
      />
      <TextWidget
        text={bar}
        style={{ fontSize: 16, color: "#39D6FF", marginTop: 6, letterSpacing: 2 }}
      />
      <TextWidget
        text={pct >= 1 ? "Bubbles is saved! 🎉" : "fill the bottle · save the cat"}
        style={{ fontSize: 11, color: "#7FA8CC", marginTop: 6 }}
      />
    </FlexWidget>
  );
}
