import { supabase } from '../lib/supabase';
import type { Profile } from '../types/database';

const MAX_AVATAR_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

export const getProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const updateProfile = async (
  userId: string,
  {
    display_name,
    birth_date,
  }: {
    display_name: string;
    birth_date: string | null;
  },
): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ display_name, birth_date })
    .eq('id', userId)
    .select('*')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const uploadAvatar = async (
  userId: string,
  file: File,
): Promise<Profile | null> => {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Дозволені формати: PNG, JPEG, WebP');
  }

  if (file.size > MAX_AVATAR_SIZE) {
    throw new Error('Файл занадто великий (максимум 2MB)');
  }

  const filePath = `${userId}/${Date.now()}-${file.name}`;

  console.log('Error', userId, filePath);
  console.log('MIME type:', file.type, '| size:', file.size);

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data: urlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  const { data, error } = await supabase
    .from('profiles')
    .update({ avatar_url: urlData.publicUrl })
    .eq('id', userId)
    .select('*')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
