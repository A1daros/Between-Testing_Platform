import { supabase } from '../lib/supabase';
import type { PlacementQuestion, PlacementResult } from '../types/database';
import { unwrap } from './helpers';

export const getPlacementQuestions = async (): Promise<PlacementQuestion[]> => {
  const data = unwrap<PlacementQuestion[] | null>(
    await supabase.rpc('get_placement_questions'),
  );

  return data ?? [];
};

export const calculatePlacementLevel = async (
  userAnswers: Record<number, number>,
): Promise<PlacementResult> =>
  unwrap(
    await supabase.rpc('calculate_placement_level', { p_answers: userAnswers }),
  );
