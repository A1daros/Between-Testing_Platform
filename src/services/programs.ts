import { supabase } from '../lib/supabase';
import type { Program, ProgramFormat } from '../types/database';
import { unwrap } from './helpers';

export const loadPrograms = async (): Promise<Program[]> =>
  unwrap(
    await supabase
      .from('program')
      .select('*')
      .order('sort_order', { ascending: true }),
  );

export const loadProgramFormats = async (): Promise<ProgramFormat[]> =>
  unwrap(
    await supabase
      .from('program_format')
      .select('*')
      .order('sort_order', { ascending: true }),
  );
