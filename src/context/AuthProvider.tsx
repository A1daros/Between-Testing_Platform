import { useEffect, useState } from 'react';
import { type Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { AuthContext } from './AuthContext';
import type { Profile } from '../types/database';
import { getProfile } from '../services/profile';
import { signOut as signOutUser } from '../services/auth';

type LoadedProfile = {
  userId: string;
  profile: Profile | null;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [loadedProfile, setLoadedProfile] = useState<LoadedProfile | null>(
    null,
  );

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
          setLoadedProfile({ userId, profile });
        }
      })
      .catch((error) => {
        console.error(error);

        if (!cancelled) {
          setLoadedProfile({ userId, profile: null });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const profile =
    userId && loadedProfile?.userId === userId ? loadedProfile.profile : null;
  const loading =
    !authReady || (userId !== null && loadedProfile?.userId !== userId);

  const signOut = async () => {
    await signOutUser();
  };

  const refreshProfile = async () => {
    if (!userId) {
      return;
    }

    const profile = await getProfile(userId);

    setLoadedProfile({ userId, profile });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
