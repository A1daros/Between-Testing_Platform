import { supabase } from '../lib/supabase';
import type { PlacementResult } from '../types/database';

export const calculatePlacementLevel = async (
  userAnswers: Record<number, number>,
): Promise<PlacementResult> => {
  const { data, error } = await supabase.rpc('calculate_placement_level', {
    p_answers: userAnswers,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data as PlacementResult;
};
