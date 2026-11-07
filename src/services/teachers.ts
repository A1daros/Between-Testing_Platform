import { supabase } from '../lib/supabase';
import type { Teacher } from '../types/database';
import { unwrap } from './helpers';

export const loadTeachers = async (): Promise<Teacher[]> =>
  unwrap(
    await supabase
      .from('teachers')
      .select('id, name, age, role, experience, specialties, photo_url')
      .order('sort_order', { ascending: true }),
  );
