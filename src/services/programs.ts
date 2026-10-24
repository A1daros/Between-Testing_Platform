import { supabase } from '../lib/supabase';
import type { Program, ProgramFormat } from '../types/database';

export const loadPrograms = async (): Promise<Program[]> => {
  const { data, error } = await supabase
    .from('program')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const loadProgramFormats = async (): Promise<ProgramFormat[]> => {
  const { data, error } = await supabase
    .from('program_format')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
