import { useEffect, useState } from 'react';
import { type Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { AuthContext } from './AuthContext';
import type { Profile } from '../types/database';
import { getProfile } from '../services/profile';
import { signOut as signOutUser } from '../services/auth';
import { captureError } from '../utils/captureError';

type LoadedProfile = {
  userId: string;
  profile: Profile | null;
  failed: boolean;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [loadedProfile, setLoadedProfile] = useState<LoadedProfile | null>(
    null,
  );
  const [loadRequestId, setLoadRequestId] = useState(0);

  const user = session?.user ?? null;
  const userId = user?.id ?? null;

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setAuthReady(true);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!userId) {
      return;
    }

    let cancelled = false;

    getProfile(userId)
      .then((profile) => {
        if (!cancelled) {
          setLoadedProfile({ userId, profile, failed: false });
        }
      })
      .catch((error) => {
        captureError(error);

        if (!cancelled) {
          setLoadedProfile({ userId, profile: null, failed: true });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [userId, loadRequestId]);

  const isCurrentProfile = userId !== null && loadedProfile?.userId === userId;
  const profile = isCurrentProfile ? loadedProfile.profile : null;
  const profileLoadFailed = isCurrentProfile && loadedProfile.failed;
  const loading = !authReady || (userId !== null && !isCurrentProfile);

  const signOut = async () => {
    await signOutUser();
  };

  const refreshProfile = async () => {
    if (!userId) {
      return;
    }

    const profile = await getProfile(userId);

    setLoadedProfile({ userId, profile, failed: false });
  };

  const retryProfileLoad = () => {
    setLoadedProfile(null);
    setLoadRequestId((id) => id + 1);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        profileLoadFailed,
        signOut,
        refreshProfile,
        retryProfileLoad,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
