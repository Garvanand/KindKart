import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type FeatureId = 
  | 'create_community'
  | 'create_request'
  | 'respond_to_request'
  | 'make_payment'
  | 'view_reputation'
  | 'earn_badges'
  | 'leaderboard'
  | 'advanced_search'
  | 'export_data'
  | 'admin_tools';

interface FeatureUnlock {
  featureId: FeatureId;
  unlocked: boolean;
  unlockedAt?: Date;
  requirement?: string;
}

interface FeatureUnlockState {
  unlocks: Record<FeatureId, FeatureUnlock>;
  checkUnlock: (featureId: FeatureId) => boolean;
  unlockFeature: (featureId: FeatureId) => void;
  resetUnlocks: () => void;
}

const defaultUnlocks: Record<FeatureId, FeatureUnlock> = {
  create_community: { featureId: 'create_community', unlocked: true }, // Always unlocked
  create_request: { featureId: 'create_request', unlocked: true }, // Always unlocked
  respond_to_request: { featureId: 'respond_to_request', unlocked: true }, // Always unlocked
  make_payment: { featureId: 'make_payment', unlocked: false, requirement: 'Complete your first help request' },
  view_reputation: { featureId: 'view_reputation', unlocked: true }, // Always unlocked
  earn_badges: { featureId: 'earn_badges', unlocked: false, requirement: 'Complete 3 help requests' },
  leaderboard: { featureId: 'leaderboard', unlocked: false, requirement: 'Earn 100 reputation points' },
  advanced_search: { featureId: 'advanced_search', unlocked: false, requirement: 'Join 2 communities' },
  export_data: { featureId: 'export_data', unlocked: false, requirement: 'Be active for 7 days' },
  admin_tools: { featureId: 'admin_tools', unlocked: false, requirement: 'Become a community admin' },
};

export const useFeatureUnlockStore = create<FeatureUnlockState>()(
  persist(
    (set, get) => ({
      unlocks: defaultUnlocks,

      checkUnlock: (featureId: FeatureId) => {
        const state = get();
        return state.unlocks[featureId]?.unlocked ?? false;
      },

      unlockFeature: (featureId: FeatureId) => {
        set((state) => ({
          unlocks: {
            ...state.unlocks,
            [featureId]: {
              ...state.unlocks[featureId],
              unlocked: true,
              unlockedAt: new Date(),
            },
          },
        }));
      },

      resetUnlocks: () => {
        set({ unlocks: defaultUnlocks });
      },
    }),
    {
      name: 'kindkart-feature-unlocks',
      storage: createJSONStorage(() => {
        if (typeof window === 'undefined') {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return localStorage;
      }),
    }
  )
);

