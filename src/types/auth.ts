import type { Session, User } from '@supabase/supabase-js';
import type { Profile } from './database';

export type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

export type LoginRedirectState = {
  from: string;
};
