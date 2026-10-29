import { supabase } from '../lib/supabase';

const AUDIO_BUCKET = 'test-audio';

// Must match file_size_limit / allowed_mime_types of the bucket.
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

// Long enough for a timed test, short enough not to work as a public link.
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

  const { error } = await supabase.storage
    .from(AUDIO_BUCKET)
    .upload(filePath, file, { contentType: file.type });

  if (error) {
    throw new Error(error.message);
  }

  return filePath;
};

export const removeTestAudio = async (paths: string[]): Promise<void> => {
  if (paths.length === 0) {
    return;
  }

  const { error } = await supabase.storage.from(AUDIO_BUCKET).remove(paths);

  if (error) {
    throw new Error(error.message);
  }
};

export const getTestAudioUrl = async (path: string): Promise<string> => {
  const { data, error } = await supabase.storage
    .from(AUDIO_BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);

  if (error) {
    throw new Error(error.message);
  }

  return data.signedUrl;
};
