import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      profile: null,
      themeMode: 'light',
      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      toggleTheme: () => set((state) => ({
        themeMode: state.themeMode === 'light' ? 'dark' : 'light',
      })),
      signOut: () => set({ user: null, profile: null }),
    }),
    { name: 'winterlog-auth', partialize: (state) => ({ themeMode: state.themeMode }) }
  )
);

export default useAuthStore;
