import React, { useCallback, useState } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Svg, { Line, Path, Rect, Text as SvgText } from "react-native-svg";
import { supabase } from "../lib/supabase";
import { GlowCard, Screen } from "../ui/components";
import { KawaiiCat } from "../ui/KawaiiCat";
import { colors, type } from "../ui/theme";

type DayRow = { day: string; total: number; goal: number | null };

// Streak = consecutive goal-met days ending today — or ending yesterday, so
// an unfinished today never kills a live streak before the day is over.
export function computeStreak(rows: DayRow[]): number {
  const byDayDesc = [...rows].sort((a, b) => (a.day < b.day ? 1 : -1));
  let streak = 0;
  for (let i = 0; i < byDayDesc.length; i++) {
    const r = byDayDesc[i];
    const met = r.goal !== null && r.total >= r.goal;
    if (met) streak++;
    else if (i === 0) continue; // today, still in progress — skip
    else break;
  }
  return streak;
}

const CHART_W = Math.min(Dimensions.get("window").width - 72, 340);
const CHART_H = 170;
const PLOT_H = 132;

function WeekChart({ week, onPick, picked }: {
  week: DayRow[]; onPick: (i: number) => void; picked: number;
}) {
  const goal = week.find((d) => d.goal !== null)?.goal ?? null;
  const max = Math.max(goal ?? 0, ...week.map((d) => d.total), 1) * 1.15;
  const bw = 26;
  const step = CHART_W / 7;
  const y = (v: number) => PLOT_H - (v / max) * PLOT_H;
  const bestIdx = week.reduce((bi, d, i) => (d.total > week[bi].total ? i : bi), 0);

  return (
    <Svg width={CHART_W} height={CHART_H}>
      {/* goal line: dashed, recessive */}
      {goal !== null && (
        <Line x1={0} y1={y(goal)} x2={CHART_W} y2={y(goal)}
          stroke={colors.textDim} strokeWidth={1.4} strokeDasharray="5 5" />
      )}
      {week.map((d, i) => {
        const h = Math.max(d.total > 0 ? 5 : 2, PLOT_H - y(d.total));
        const x = i * step + (step - bw) / 2;
        const met = d.goal !== null && d.total >= d.goal;
        const isToday = i === week.length - 1;
        return (
          <React.Fragment key={d.day}>
            {/* bar: rounded data-end, anchored to the baseline */}
            <Rect
              x={x} y={PLOT_H - h} width={bw} height={h} rx={4}
              fill={d.total > 0 ? "#55A8F2" : "rgba(120,190,255,0.15)"}
              opacity={picked === i ? 1 : 0.88}
              onPress={() => onPick(i)}
            />
            {/* goal-met: gold star marker (icon, not color-alone) */}
            {met && (
              <Path
                d={`M${x + bw / 2} ${PLOT_H - h - 14} l2.6 5.4 6 .6 -4.5 4 1.3 5.9 -5.4 -3.1 -5.4 3.1 1.3 -5.9 -4.5 -4 6 -.6 z`}
                fill={colors.gold}
              />
            )}
            {/* selective labels: today + best day only */}
            {(isToday || i === bestIdx) && d.total > 0 && (
              <SvgText x={x + bw / 2} y={y(d.total) - (met ? 22 : 6)}
                fontSize={11} fontWeight="700" fill={colors.text} textAnchor="middle">
                {(d.total / 1000).toFixed(1)}
              </SvgText>
            )}
            {/* weekday letter */}
            <SvgText x={x + bw / 2} y={PLOT_H + 18} fontSize={11}
              fill={picked === i ? colors.aqua : colors.textDim} textAnchor="middle"
              fontWeight={isToday ? "700" : "400"}>
              {"SMTWTFS"[new Date(d.day + "T12:00:00").getDay()]}
            </SvgText>
          </React.Fragment>
        );
      })}
      {/* baseline */}
      <Line x1={0} y1={PLOT_H} x2={CHART_W} y2={PLOT_H}
        stroke={colors.cardBorder} strokeWidth={1.4} />
    </Svg>
  );
}

export default function HistoryScreen() {
  const [rows, setRows] = useState<DayRow[]>([]);
  const [picked, setPicked] = useState(6);

  useFocusEffect(useCallback(() => {
    (async () => {
      const { data } = await supabase.rpc("daily_history", { p_days: 30 });
      if (data) {
        setRows(data.map((r: { day: string; total: string; goal: string | null }) => ({
          day: r.day,
          total: Number(r.total),
          goal: r.goal !== null ? Number(r.goal) : null,
        })));
        setPicked(6);
      }
    })();
  }, []));

  if (rows.length === 0) {
    return (
      <Screen style={styles.centerAll}>
        <KawaiiCat mood="sleepy" size={90} />
        <Text style={type.dim}>Loading your rescue history…</Text>
      </Screen>
    );
  }

  const week = rows.slice(-7);
  const streak = computeStreak(rows);
  const savedThisWeek = week.filter((d) => d.goal !== null && d.total >= d.goal).length;
  const weekTotal = week.reduce((s, d) => s + d.total, 0);
  const sel = week[Math.min(picked, week.length - 1)];
  const selMet = sel.goal !== null && sel.total >= sel.goal;

  return (
    <Screen style={styles.container}>
      <View style={styles.statRow}>
        <GlowCard style={styles.stat}>
          <Text style={styles.statBig}>🔥 {streak}</Text>
          <Text style={styles.statLabel}>day streak</Text>
        </GlowCard>
        <GlowCard style={styles.stat}>
          <Text style={styles.statBig}>🏆 {savedThisWeek}/7</Text>
          <Text style={styles.statLabel}>rescues this week</Text>
        </GlowCard>
        <GlowCard style={styles.stat}>
          <Text style={styles.statBig}>{(weekTotal / 1000).toFixed(1)}L</Text>
          <Text style={styles.statLabel}>this week</Text>
        </GlowCard>
      </View>

      <GlowCard style={styles.chartCard}>
        <Text style={type.label}>Last 7 days · litres</Text>
        <WeekChart week={week} onPick={setPicked} picked={picked} />
        {/* tap-a-bar detail (the mobile stand-in for a hover tooltip) */}
        <View style={styles.tipRow}>
          <Text style={type.dim}>
            {new Date(sel.day + "T12:00:00").toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" })}
            {": "}
          </Text>
          <Text style={type.body}>
            {(sel.total / 1000).toFixed(2)}L{sel.goal ? ` of ${(sel.goal / 1000).toFixed(1)}L` : ""}
            {selMet ? "  · Bubbles saved! 🏆" : ""}
          </Text>
        </View>
      </GlowCard>

      <GlowCard style={styles.mascotCard}>
        <KawaiiCat mood={streak >= 3 ? "party" : savedThisWeek > 0 ? "happy" : "content"} size={54} />
        <Text style={[type.body, styles.mascotLine]}>
          {streak >= 3
            ? `${streak} days in a row — Bubbles feels very safe with you! 🎉`
            : savedThisWeek > 0
              ? `You saved Bubbles ${savedThisWeek} time${savedThisWeek > 1 ? "s" : ""} this week. Keep it up!`
              : "No rescues yet this week — today's a great day to start."}
        </Text>
      </GlowCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: 16, gap: 14 },
  centerAll: { alignItems: "center", justifyContent: "center", gap: 12 },
  statRow: { flexDirection: "row", gap: 10 },
  stat: { flex: 1, alignItems: "center", paddingVertical: 14, paddingHorizontal: 6, gap: 2 },
  statBig: { fontSize: 19, fontWeight: "800", color: colors.text },
  statLabel: { fontSize: 11, color: colors.textDim, textAlign: "center" },
  chartCard: { alignItems: "center", gap: 10 },
  tipRow: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center" },
  mascotCard: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 },
  mascotLine: { flex: 1 },
});
