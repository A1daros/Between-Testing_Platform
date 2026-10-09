import { supabase } from '../lib/supabase';
import type { Teacher } from '../types/database';

export const loadTeachers = async (): Promise<Teacher[]> => {
  const { data, error } = await supabase
    .from('teachers')
    .select('id, name, age, role, experience, specialties, photo_url')
    .order('sort_order', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
