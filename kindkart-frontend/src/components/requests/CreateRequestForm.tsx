'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HELP_REQUEST_CATEGORIES, PRIVACY_LEVELS } from '@/lib/constants';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';

const createRequestSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description must be less than 1000 characters'),
  category: z.string().min(1, 'Please select a category'),
  location: z.string().optional(),
  timing: z.string().optional(),
  privacyLevel: z.enum(['community', 'public']).default('community'),
});

type CreateRequestFormData = z.infer<typeof createRequestSchema>;

interface CreateRequestFormProps {
  communityId: string;
  onSuccess?: (request: any) => void;
}

export function CreateRequestForm({ communityId, onSuccess }: CreateRequestFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const { user } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CreateRequestFormData>({
    resolver: zodResolver(createRequestSchema),
    defaultValues: {
      privacyLevel: 'community',
    },
  });

  const privacyLevel = watch('privacyLevel');

  const onSubmit = async (data: CreateRequestFormData) => {
    if (!user) {
      setError('You must be logged in to create a request');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const request = await api.requests.create({
        ...data,
        communityId,
        category: selectedCategory,
      });
      
      if (onSuccess) {
        onSuccess(request);
      }
      
      reset();
      setSelectedCategory('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create request');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setValue('category', categoryId);
  };

  const selectedCategoryData = HELP_REQUEST_CATEGORIES.find(cat => cat.id === selectedCategory);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create Help Request</CardTitle>
        <CardDescription>
          Ask your neighbors for assistance. Be specific about what you need help with.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Category Selection */}
          <div className="space-y-3">
            <Label>Category *</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {HELP_REQUEST_CATEGORIES.map((category) => (
                <div
                  key={category.id}
                  className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedCategory === category.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleCategorySelect(category.id)}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">{category.icon}</div>
                    <h4 className="font-medium text-sm">{category.name}</h4>
                    <p className="text-xs text-gray-600 mt-1">{category.description}</p>
                  </div>
                </div>
              ))}
            </div>
            {errors.category && (
              <p className="text-sm text-red-600">{errors.category.message}</p>
            )}
          </div>

          {/* Request Details */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Request Title *</Label>
              <Input
                id="title"
                type="text"
                placeholder="e.g., Need help with grocery shopping"
                {...register('title')}
              />
              {errors.title && (
                <p className="text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Please describe what you need help with, when you need it, and any specific requirements..."
                rows={4}
                {...register('description')}
              />
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location (Optional)</Label>
                <Input
                  id="location"
                  type="text"
                  placeholder="e.g., Near Main Street"
                  {...register('location')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timing">When do you need help? (Optional)</Label>
                <Input
                  id="timing"
                  type="text"
                  placeholder="e.g., This weekend, Tomorrow morning"
                  {...register('timing')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Privacy Level</Label>
              <Select value={privacyLevel} onValueChange={(value) => setValue('privacyLevel', value as 'community' | 'public')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="community">
                    <div>
                      <div className="font-medium">Community Only</div>
                      <div className="text-sm text-gray-500">Only visible to community members</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="public">
                    <div>
                      <div className="font-medium">Public</div>
                      <div className="text-sm text-gray-500">Visible to everyone on KindKart</div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Selected Category Preview */}
          {selectedCategoryData && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{selectedCategoryData.icon}</div>
                <div>
                  <h4 className="font-medium">{selectedCategoryData.name}</h4>
                  <p className="text-sm text-gray-600">{selectedCategoryData.description}</p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <Button type="submit" disabled={isLoading || !selectedCategory} className="w-full">
            {isLoading ? 'Creating Request...' : 'Create Help Request'}
          </Button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Tips for a good request:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Be specific about what you need help with</li>
            <li>• Include timing and location details</li>
            <li>• Mention any special requirements or constraints</li>
            <li>• Be respectful and clear in your communication</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
