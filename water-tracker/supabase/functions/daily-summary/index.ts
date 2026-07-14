// Daily hydration summary push.
// Scheduled every 15 minutes (pg_cron -> net.http_post, see water-tracker/README.md).
// For each user whose local time is inside their notify window and who hasn't
// been summarized today, sum today's water events vs. goal and send ONE push.

import { createClient } from "npm:@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const WINDOW_MINUTES = 15;

type Profile = {
  id: string;
  timezone: string;
  notify_at: string; // 'HH:MM:SS'
  expo_push_token: string | null;
  last_summary_date: string | null;
};

function localParts(tz: string, d = new Date()) {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: false,
  });
  const p = Object.fromEntries(fmt.formatToParts(d).map((x) => [x.type, x.value]));
  return {
    date: `${p.year}-${p.month}-${p.day}`,
    minutes: Number(p.hour) % 24 * 60 + Number(p.minute),
  };
}

Deno.serve(async (req) => {
  if (req.headers.get("authorization") !== `Bearer ${Deno.env.get("CRON_SECRET")}`) {
    return new Response("unauthorized", { status: 401 });
  }

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, timezone, notify_at, expo_push_token, last_summary_date")
    .not("expo_push_token", "is", null);
  if (error) return new Response(error.message, { status: 500 });

  const due: { profile: Profile; localDate: string }[] = [];
  for (const profile of (profiles ?? []) as Profile[]) {
    let local;
    try {
      local = localParts(profile.timezone);
    } catch {
      continue; // bad tz string; skip rather than crash the batch
    }
    const [h, m] = profile.notify_at.split(":").map(Number);
    const target = h * 60 + m;
    const inWindow = local.minutes >= target && local.minutes < target + WINDOW_MINUTES;
    if (inWindow && profile.last_summary_date !== local.date) {
      due.push({ profile, localDate: local.date });
    }
  }

  const messages: object[] = [];
  for (const { profile, localDate } of due) {
    const { data: rows } = await supabase.rpc("admin_today_total", {
      p_user_id: profile.id,
    });
    const total = Number(rows?.[0]?.total ?? 0);
    const goal = Number(rows?.[0]?.goal ?? 0);

    const litres = (n: number) => `${(n / 1000).toFixed(1)}L`;
    const body = goal > 0
      ? total >= goal
        ? `💧 ${litres(total)} / ${litres(goal)} — goal hit. Nice.`
        : `You logged ${litres(total)} of ${litres(goal)} today. Bottle before bed?`
      : `You logged ${litres(total)} today. Set a daily goal in Settings!`;

    messages.push({
      to: profile.expo_push_token,
      title: "Today's hydration",
      body,
      sound: "default",
    });

    await supabase
      .from("profiles")
      .update({ last_summary_date: localDate })
      .eq("id", profile.id);
  }

  if (messages.length > 0) {
    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(messages),
    });
  }

  return Response.json({ notified: messages.length });
});
