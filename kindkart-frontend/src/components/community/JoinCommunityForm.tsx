'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';

const joinCommunitySchema = z.object({
  inviteCode: z.string()
    .min(6, 'Invite code must be 6 characters')
    .max(6, 'Invite code must be 6 characters')
    .regex(/^[A-Z0-9]+$/, 'Invite code must contain only uppercase letters and numbers'),
});

type JoinCommunityFormData = z.infer<typeof joinCommunitySchema>;

interface JoinCommunityFormProps {
  onSuccess?: (membership: any) => void;
}

export function JoinCommunityForm({ onSuccess }: JoinCommunityFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<JoinCommunityFormData>({
    resolver: zodResolver(joinCommunitySchema),
  });

  const inviteCode = watch('inviteCode');

  // Auto-format invite code to uppercase
  const handleInviteCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    setValue('inviteCode', value);
  };

  const onSubmit = async (data: JoinCommunityFormData) => {
    if (!user) {
      setError('You must be logged in to join a community');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const membership = await api.communities.join(data.inviteCode);
      
      setSuccess('Join request submitted successfully! The community admin will review your request.');
      
      if (onSuccess) {
        onSuccess(membership.membership);
      }
      
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join community');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Join a Community</CardTitle>
        <CardDescription>
          Enter the invite code you received from a community member
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="inviteCode">Invite Code *</Label>
            <Input
              id="inviteCode"
              type="text"
              placeholder="ABC123"
              value={inviteCode || ''}
              onChange={handleInviteCodeChange}
              className="text-center text-xl tracking-widest font-mono"
              maxLength={6}
            />
            {errors.inviteCode && (
              <p className="text-sm text-red-600">{errors.inviteCode.message}</p>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-600">{success}</p>
            </div>
          )}

          <Button type="submit" disabled={isLoading || !inviteCode || inviteCode.length !== 6} className="w-full">
            {isLoading ? 'Joining...' : 'Join Community'}
          </Button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Your join request will be sent to the community admin</li>
            <li>• The admin will review your request</li>
            <li>• You'll be notified once approved</li>
            <li>• Then you can start helping your neighbors!</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
