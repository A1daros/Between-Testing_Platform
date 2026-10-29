import type { Profile } from '../types/database';

// Mirrors private.is_approved(): admins always have access.
export const isProfileApproved = (profile: Profile | null): boolean =>
  profile !== null &&
  (profile.role === 'admin' || profile.status === 'approved');
