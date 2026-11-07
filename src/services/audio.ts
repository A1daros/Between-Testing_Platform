// MAX_AUDIO_SIZE and ALLOWED_AUDIO_TYPES must match file_size_limit and
// allowed_mime_types of the test-audio bucket. The signed URL lives long
// enough for a timed test, but too short to work as a public link.
import { supabase } from '../lib/supabase';
import { unwrap } from './helpers';

const AUDIO_BUCKET = 'test-audio';

export const MAX_AUDIO_SIZE = 20 * 1024 * 1024;

export const ALLOWED_AUDIO_TYPES = [
  'audio/mpeg',
  'audio/mp4',
  'audio/x-m4a',
  'audio/aac',
  'audio/ogg',
  'audio/wav',
  'audio/x-wav',
  'audio/webm',
];

const SIGNED_URL_TTL_SECONDS = 2 * 60 * 60;

export const validateAudioFile = (file: File): string | null => {
  if (!ALLOWED_AUDIO_TYPES.includes(file.type)) {
    return 'Дозволені формати: MP3, M4A, AAC, OGG, WAV, WebM';
  }

  if (file.size > MAX_AUDIO_SIZE) {
    return 'Файл занадто великий (максимум 20 МБ)';
  }

  return null;
};

export const uploadTestAudio = async (file: File): Promise<string> => {
  const validationError = validateAudioFile(file);

  if (validationError) {
    throw new Error(validationError);
  }

  const extension = file.name.split('.').pop()?.toLowerCase() ?? 'audio';
  const filePath = `parts/${crypto.randomUUID()}.${extension}`;

  unwrap(
    await supabase.storage
      .from(AUDIO_BUCKET)
      .upload(filePath, file, { contentType: file.type }),
  );

  return filePath;
};

export const removeTestAudio = async (paths: string[]): Promise<void> => {
  if (paths.length === 0) {
    return;
  }

  unwrap(await supabase.storage.from(AUDIO_BUCKET).remove(paths));
};

export const getTestAudioUrl = async (path: string): Promise<string> => {
  const data = unwrap(
    await supabase.storage
      .from(AUDIO_BUCKET)
      .createSignedUrl(path, SIGNED_URL_TTL_SECONDS),
  );

  return data.signedUrl;
};
