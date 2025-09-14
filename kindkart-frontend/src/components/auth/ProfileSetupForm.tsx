'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  age: z.string().optional(),
  qualification: z.string().optional(),
  certifications: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileSetupFormProps {
  onComplete: (data: ProfileFormData) => void;
  isLoading?: boolean;
}

export function ProfileSetupForm({ onComplete, isLoading = false }: ProfileSetupFormProps) {
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  const onSubmit = (data: ProfileFormData) => {
    setError('');
    
    // Convert certifications string to array
    const certifications = data.certifications
      ? data.certifications.split(',').map(cert => cert.trim()).filter(cert => cert)
      : [];

    onComplete({
      ...data,
      age: data.age ? parseInt(data.age) : undefined,
      certifications,
    });
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Complete Your Profile</CardTitle>
        <CardDescription>
          Help your neighbors get to know you better
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="age">Age (Optional)</Label>
            <Input
              id="age"
              type="number"
              placeholder="25"
              min="18"
              max="100"
              {...register('age')}
            />
            {errors.age && (
              <p className="text-sm text-red-600">{errors.age.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="qualification">Qualification (Optional)</Label>
            <Input
              id="qualification"
              type="text"
              placeholder="Bachelor's in Computer Science"
              {...register('qualification')}
            />
            {errors.qualification && (
              <p className="text-sm text-red-600">{errors.qualification.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="certifications">Certifications (Optional)</Label>
            <Input
              id="certifications"
              type="text"
              placeholder="CPR Certified, First Aid, etc."
              {...register('certifications')}
            />
            <p className="text-xs text-gray-500">
              Separate multiple certifications with commas
            </p>
            {errors.certifications && (
              <p className="text-sm text-red-600">{errors.certifications.message}</p>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Creating Profile...' : 'Complete Setup'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
