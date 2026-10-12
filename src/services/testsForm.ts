import { supabase } from '../lib/supabase';
import type { NewTestPayload } from '../modules/admin/AdminDashboard/components/Tests/types/testForm';

export const createTest = async (payload: NewTestPayload) => {
  const { data, error } = await supabase.rpc('save_test', {
    p_payload: payload,
  });

  if (error) {
    throw new Error(`Failed to create test: ${error.message}`);
  }

  return data;
};

export const updateTest = async (testId: number, payload: NewTestPayload) => {
  const { data, error } = await supabase.rpc('save_test', {
    p_payload: payload,
    p_test_id: testId,
  });

  if (error) {
    throw new Error(`Failed to update test: ${error.message}`);
  }

  return data;
};

export const deleteTest = async (testId: number) => {
  const { error } = await supabase.rpc('delete_test', { p_test_id: testId });

  if (error) {
    throw new Error(`Failed to delete test: ${error.message}`);
  }
};
