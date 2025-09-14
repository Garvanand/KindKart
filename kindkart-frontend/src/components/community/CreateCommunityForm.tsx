'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

const createCommunitySchema = z.object({
  name: z.string().min(2, 'Community name must be at least 2 characters').max(50, 'Community name must be less than 50 characters'),
  rules: z.string().optional(),
});

type CreateCommunityFormData = z.infer<typeof createCommunitySchema>;

interface CreateCommunityFormProps {
  onSuccess?: (community: any) => void;
}

export function CreateCommunityForm({ onSuccess }: CreateCommunityFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { user } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateCommunityFormData>({
    resolver: zodResolver(createCommunitySchema),
  });

  const onSubmit = async (data: CreateCommunityFormData) => {
    if (!user) {
      setError('You must be logged in to create a community');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const community = await api.communities.create(data);
      
      if (onSuccess) {
        onSuccess(community.community);
      } else {
        // Redirect to the new community
        router.push(`/communities/${community.community.id}`);
      }
      
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create community');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create New Community</CardTitle>
        <CardDescription>
          Start a new neighborhood community to connect with your neighbors
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Community Name *</Label>
            <Input
              id="name"
              type="text"
              placeholder="e.g., Oakwood Apartments"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="rules">Community Rules (Optional)</Label>
            <Textarea
              id="rules"
              placeholder="Set guidelines for your community..."
              rows={4}
              {...register('rules')}
            />
            <p className="text-xs text-gray-500">
              You can always update these rules later
            </p>
            {errors.rules && (
              <p className="text-sm text-red-600">{errors.rules.message}</p>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Creating Community...' : 'Create Community'}
          </Button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• You'll become the admin of this community</li>
            <li>• A unique invite code will be generated</li>
            <li>• You can invite neighbors using the code</li>
            <li>• You'll approve new member requests</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
