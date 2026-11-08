import { supabase } from '../lib/supabase';
import type {
  AdminResultsPage,
  AdminResultsSort,
  Result,
} from '../types/database';
import { unwrap, unwrapCount } from './helpers';

const RESULT_SELECT = `*,
  tests(title, test_type, content_updated_at),
  profiles(display_name)`;

export const getResultsByUserId = async (userId: string): Promise<Result[]> =>
  unwrap(
    await supabase
      .from('results')
      .select(RESULT_SELECT)
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
  );

export const loadRecentResults = async (): Promise<Result[]> =>
  unwrap(
    await supabase
      .from('results')
      .select(RESULT_SELECT)
      .order('created_at', { ascending: false })
      .limit(6),
  );

export const loadAttemptResults = async (): Promise<number> =>
  unwrapCount(
    await supabase.from('results').select('*', { count: 'exact', head: true }),
  );

type GetAdminResultsParams = {
  query: string;
  sort: AdminResultsSort;
  page: number;
  pageSize: number;
};

export const getAdminResults = async ({
  query,
  sort,
  page,
  pageSize,
}: GetAdminResultsParams): Promise<AdminResultsPage> =>
  unwrap(
    await supabase.rpc('get_admin_results', {
      p_query: query,
      p_sort: sort,
      p_limit: pageSize,
      p_offset: (page - 1) * pageSize,
    }),
  );
