import { supabase } from '../lib/supabase';
import type {
  Profile,
  ProfileStatus,
  StudentWithResults,
  StudentProfile,
} from '../types/database';
import { unwrap, unwrapCount } from './helpers';

const AVATAR_BUCKET = 'avatars';
const AVATAR_PUBLIC_PATH = `/object/public/${AVATAR_BUCKET}/`;
const MAX_AVATAR_SIZE = 2 * 1024 * 1024;

export const ALLOWED_AVATAR_TYPES: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
};

export const validateAvatarFile = (file: File): string | null => {
  if (!(file.type in ALLOWED_AVATAR_TYPES)) {
    return 'Дозволені формати: PNG, JPEG, WebP';
  }

  if (file.size > MAX_AVATAR_SIZE) {
    return 'Файл занадто великий (максимум 2 МБ)';
  }

  return null;
};

const getAvatarPath = (avatarUrl: string | null): string | null => {
  const index = avatarUrl?.indexOf(AVATAR_PUBLIC_PATH) ?? -1;

  if (!avatarUrl || index === -1) {
    return null;
  }

  return decodeURIComponent(avatarUrl.slice(index + AVATAR_PUBLIC_PATH.length));
};

export const getProfile = async (userId: string): Promise<Profile | null> =>
  unwrap(
    await supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
  );

export const updateProfile = async (
  userId: string,
  {
    display_name,
    birth_date,
  }: {
    display_name: string;
    birth_date: string | null;
  },
): Promise<Profile> =>
  unwrap(
    await supabase
      .from('profiles')
      .update({ display_name, birth_date })
      .eq('id', userId)
      .select('*')
      .single(),
  );

export const uploadAvatar = async (
  userId: string,
  file: File,
  previousAvatarUrl: string | null,
): Promise<Profile> => {
  const validationError = validateAvatarFile(file);

  if (validationError) {
    throw new Error(validationError);
  }

  const filePath = `${userId}/${crypto.randomUUID()}.${ALLOWED_AVATAR_TYPES[file.type]}`;

  unwrap(
    await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(filePath, file, { contentType: file.type }),
  );

  const { data: urlData } = supabase.storage
    .from(AVATAR_BUCKET)
    .getPublicUrl(filePath);

  const profile = unwrap<Profile>(
    await supabase
      .from('profiles')
      .update({ avatar_url: urlData.publicUrl })
      .eq('id', userId)
      .select('*')
      .single(),
  );

  const previousPath = getAvatarPath(previousAvatarUrl);

  if (previousPath) {
    const { error } = await supabase.storage
      .from(AVATAR_BUCKET)
      .remove([previousPath]);

    if (error) {
      console.error('Failed to remove previous avatar:', error);
    }
  }

  return profile;
};

export const loadCountStudents = async (): Promise<number> =>
  unwrapCount(
    await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'student'),
  );

export const loadCountPendingStudents = async (): Promise<number> =>
  unwrapCount(
    await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'student')
      .eq('status', 'pending'),
  );

export const setProfileStatus = async (
  userId: string,
  status: ProfileStatus,
): Promise<ProfileStatus> => {
  const data = unwrap<{ status: ProfileStatus }>(
    await supabase.rpc('set_profile_status', {
      p_user_id: userId,
      p_status: status,
    }),
  );

  return data.status;
};

export const loadStudents = async (): Promise<StudentProfile[]> =>
  unwrap(
    await supabase
      .from('profiles')
      .select(`*, results(count)`)
      .eq('role', 'student')
      .order('created_at', { ascending: false, nullsFirst: false }),
  );

export const loadStudentDetails = async (
  studentId: string,
): Promise<StudentWithResults | null> =>
  unwrap(
    await supabase
      .from('profiles')
      .select(
        `*, results(id, score, total, created_at, tests(id, title, content_updated_at))`,
      )
      .eq('id', studentId)
      .order('created_at', { referencedTable: 'results', ascending: false })
      .maybeSingle(),
  );
