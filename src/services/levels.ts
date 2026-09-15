import { supabase } from "../lib/supabase";
import type { Level } from "../types/database";

export const getLevelsById = async (): Promise<Level[]> => {
  const { data, error } = await supabase
    .from('levels')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
