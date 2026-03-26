import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { demoGuestProfiles } from '@/lib/demo-data';

interface User {
  id: string;
  email: string;
  phone: string;
  name: string;
  isVerified: boolean;
  isGuest?: boolean;
  guestId?: string;
  avatar?: string;
  rank?: string;
  xp?: number;
  level?: number;
  trustScore?: number;
  availability?: 'available' | 'busy' | 'vacation' | 'emergency_responder';
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
  isHydrated: boolean;
  demoMode: boolean;
}

interface AuthActions {
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  setTokens: (accessToken: string, refreshToken?: string) => void;
  setLoading: (loading: boolean) => void;
  setHydrated: (hydrated: boolean) => void;
  loginAsGuest: () => void;
  setAvailability: (status: User['availability']) => void;
  setDemoMode: (demo: boolean) => void;
  logout: () => void;
  clearAuth: () => void;
}

type AuthStore = AuthState & AuthActions;

const createSafeStorage = () => {
  if (typeof window === 'undefined') {
    return { getItem: () => null, setItem: () => {}, removeItem: () => {} };
  }
  return localStorage;
};

function generateGuestId(): string {
  return `guest_${Math.floor(1000 + Math.random() * 9000)}`;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isGuest: false,
      isLoading: false,
      isHydrated: false,
      demoMode: false,

      setAuth: (user, accessToken, refreshToken) => {
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isGuest: false,
          isLoading: false,
          demoMode: false,
        });
      },

      setUser: (user) => set({ user }),

      setTokens: (accessToken, refreshToken) => {
        set((state) => ({
          accessToken,
          refreshToken: refreshToken || state.refreshToken,
          isAuthenticated: !!accessToken,
        }));
      },

      setLoading: (isLoading) => set({ isLoading }),
      setHydrated: (isHydrated) => set({ isHydrated }),

      loginAsGuest: () => {
        const guestId = generateGuestId();
        const guestNum = guestId.split('_')[1];
        const profile = demoGuestProfiles[Math.floor(Math.random() * demoGuestProfiles.length)];
        set({
          user: {
            id: guestId,
            email: '',
            phone: '',
            name: `${profile?.name || 'Guest'} #${guestNum}`,
            isVerified: false,
            isGuest: true,
            guestId,
            rank: profile?.rank || 'Visitor',
            xp: profile?.xp || 0,
            level: profile?.level || 1,
            trustScore: profile?.trustScore || 0,
            availability: 'available',
          },
          accessToken: `guest_token_${guestId}`,
          refreshToken: null,
          isAuthenticated: true,
          isGuest: true,
          isLoading: false,
          demoMode: true,
        });
      },

      setAvailability: (status) => {
        set((state) => ({
          user: state.user ? { ...state.user, availability: status } : null,
        }));
      },

      setDemoMode: (demoMode) => set({ demoMode }),

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isGuest: false,
          isLoading: false,
          demoMode: false,
        });
      },

      clearAuth: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isGuest: false,
          isLoading: false,
          demoMode: false,
        });
      },
    }),
    {
      name: 'kindkart-auth-storage',
      storage: createJSONStorage(() => createSafeStorage()),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        isGuest: state.isGuest,
        demoMode: state.demoMode,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) state.setHydrated(true);
      },
    }
  )
);
