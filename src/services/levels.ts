import { supabase } from '../lib/supabase';
import type { Level } from '../types/database';
import { unwrap } from './helpers';

export const getLevels = async (): Promise<Level[]> =>
  unwrap(
    await supabase
      .from('levels')
      .select('*')
      .order('sort_order', { ascending: true }),
  );
