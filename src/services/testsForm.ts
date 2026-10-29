import { supabase } from '../lib/supabase';
import type { NewTestPayload } from '../modules/admin/AdminDashboard/components/Tests/types/testForm';
import { removeTestAudio } from './audio';

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
  // delete_test only removes rows, so audio files are collected beforehand
  // and removed from Storage afterwards.
  const { data: parts, error: partsError } = await supabase
    .from('test_parts')
    .select('audio_path')
    .eq('test_id', testId);

  if (partsError) {
    throw new Error(`Failed to delete test: ${partsError.message}`);
  }

  const { error } = await supabase.rpc('delete_test', { p_test_id: testId });

  if (error) {
    throw new Error(`Failed to delete test: ${error.message}`);
  }

  const audioPaths = parts
    .map((part) => part.audio_path)
    .filter((path): path is string => Boolean(path));

  try {
    await removeTestAudio(audioPaths);
  } catch (removeError) {
    // The test is already deleted; a leftover file is not worth failing for.
    console.error('Failed to remove test audio:', removeError);
  }
};
