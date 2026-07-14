import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

export const TAG_DOMAIN = process.env.EXPO_PUBLIC_TAG_DOMAIN ?? "minitee.app";

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);

export type EventRow = {
  id: string;
  value: number;
  occurred_at: string;
  source: string;
  bottle_id: string | null;
  client_event_id: string;
};

export type UserBottle = {
  bottle_id: string;
  nickname: string;
  capacity_ml: number;
  bottles: { short_code: string };
};
