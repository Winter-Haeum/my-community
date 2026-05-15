import { useEffect } from 'react';
import { supabase } from '../utils/supabase';
import useAuthStore from '../store/auth-store';

export function useAuth() {
  const { setUser, setProfile, signOut } = useAuthStore();

  useEffect(() => {
    // getSession + onAuthStateChange 중복 호출 제거 → onAuthStateChange 단일 처리
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === 'INITIAL_SESSION' || event === 'SIGNED_IN') && session?.user) {
        setUser(session.user);
        const { data: profile } = await supabase
          .from('winterlog_users')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
        setProfile(profile);
      } else if (event === 'SIGNED_OUT') {
        signOut();
      }
    });

    return () => subscription.unsubscribe();
  }, []);
}
