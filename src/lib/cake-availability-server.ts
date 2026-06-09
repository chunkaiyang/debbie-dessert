import { getDemoCakeOrderingData, normalizeLiveOrderingData } from "@/lib/cake-availability";
import type { CakeOrderingData } from "@/lib/cake-availability";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function getCakeOrderingData(): Promise<CakeOrderingData> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return getDemoCakeOrderingData();

  const { data, error } = await supabase.rpc("get_cake_ordering_data");
  if (error || !data) return getDemoCakeOrderingData();

  return normalizeLiveOrderingData(data);
}
