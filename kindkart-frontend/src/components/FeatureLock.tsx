'use client';

import { Lock, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFeatureUnlockStore, FeatureId } from '@/store/featureUnlockStore';

interface FeatureLockProps {
  featureId: FeatureId;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showLockedMessage?: boolean;
}

export function FeatureLock({ 
  featureId, 
  children, 
  fallback,
  showLockedMessage = true 
}: FeatureLockProps) {
  const isUnlocked = useFeatureUnlockStore((state) => state.checkUnlock(featureId));
  const unlocks = useFeatureUnlockStore((state) => state.unlocks);

  const feature = unlocks[featureId];

  if (isUnlocked) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="relative">
      <div className="opacity-50 pointer-events-none select-none">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-lg">
        <Card className="w-full max-w-sm border-2 border-dashed">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <Lock className="w-12 h-12 text-gray-400" />
                <Sparkles className="w-6 h-6 text-yellow-500 absolute -top-2 -right-2" />
              </div>
            </div>
            <CardTitle>Feature Locked</CardTitle>
            <CardDescription>
              {feature?.requirement || 'Complete requirements to unlock this feature'}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button
              variant="outline"
              onClick={() => {
                // Show info about unlocking
                alert(`To unlock this feature: ${feature?.requirement || 'Complete the requirements'}`);
              }}
            >
              Learn More
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

