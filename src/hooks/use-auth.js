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
  // setUser/setProfile/signOut는 Zustand action으로 참조가 항상 안정적이라
  // 추가해도 재구독을 유발하지 않는다.
  }, [setUser, setProfile, signOut]);
}
