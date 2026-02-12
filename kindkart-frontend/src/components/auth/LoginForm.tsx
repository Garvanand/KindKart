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
import { LoadingSpinner } from '@/components/LoadingSpinner';

const loginSchema = z.object({
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').optional().or(z.literal('')),
}).refine((data) => data.email || data.phone, {
  message: "Either email or phone is required",
  path: ["email"],
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess: () => void;
  onGuestLogin?: () => void;
}

export function LoginForm({ onSuccess, onGuestLogin }: LoginFormProps) {
  const [step, setStep] = useState<'input' | 'otp'>('input');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGuestLoading, setIsGuestLoading] = useState(false);
  const [error, setError] = useState('');

  const { setAuth, setLoading } = useAuthStore();

  const handleGuestLogin = async () => {
    setIsGuestLoading(true);
    setError('');

    try {
      const response: any = await api.auth.guestLogin();
      const guestUser = { ...response.user, isGuest: true };
      setAuth(guestUser, response.accessToken, response.refreshToken);
      if (onGuestLogin) {
        onGuestLogin();
      } else {
        onSuccess();
      }
    } catch (err) {
      console.warn('Guest login (backend unavailable), using offline guest:', err);
      const errorMessage = err instanceof Error ? err.message : '';
      const isOffline = errorMessage.includes('Unable to connect') || errorMessage.includes('Failed to fetch');

      // Work without backend: create local guest user so app is still usable
      if (isOffline) {
        const offlineGuest = {
          id: `guest-${Date.now()}`,
          email: '',
          phone: '',
          name: 'Guest',
          isVerified: false,
          isGuest: true,
        };
        setAuth(offlineGuest, 'guest-offline', 'guest-offline');
        if (onGuestLogin) {
          onGuestLogin();
        } else {
          onSuccess();
        }
      } else {
        setError(errorMessage || 'Failed to create guest session');
      }
    } finally {
      setIsGuestLoading(false);
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError('');

    try {
      await api.auth.sendOTP(data);
      setStep('otp');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const formData = getValues();
      const response = await api.auth.verifyOTP({
        ...formData,
        otp,
      });

      setAuth(response.user, response.accessToken, response.refreshToken);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify OTP');
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'otp') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Enter Verification Code</CardTitle>
          <CardDescription>
            We sent a 6-digit code to your {getValues().email ? 'email' : 'phone'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading && <LoadingSpinner size="sm" text="Verifying..." />}
          <div className="space-y-2">
            <Label htmlFor="otp">Verification Code</Label>
            <Input
              id="otp"
              type="text"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              className="text-center text-2xl tracking-widest"
            />
          </div>
          
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <Button
            onClick={verifyOTP}
            disabled={isLoading || otp.length !== 6}
            className="w-full"
          >
            {isLoading ? 'Verifying...' : 'Verify Code'}
          </Button>

          <Button
            variant="outline"
            onClick={() => setStep('input')}
            className="w-full"
          >
            Back to Login
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Welcome to KindKart</CardTitle>
        <CardDescription>
          Sign in to connect with your neighborhood community
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email (Optional)</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number (Optional)</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              {...register('phone')}
            />
            {errors.phone && (
              <p className="text-sm text-red-600">{errors.phone.message}</p>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <Button type="submit" disabled={isLoading || isGuestLoading} className="w-full">
            {isLoading ? 'Sending Code...' : 'Send Verification Code'}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or</span>
            </div>
          </div>

          <Button 
            type="button"
            variant="outline" 
            onClick={handleGuestLogin}
            disabled={isLoading || isGuestLoading}
            className="w-full"
          >
            {isGuestLoading ? 'Creating Guest Session...' : 'Continue as Guest'}
          </Button>
          <p className="text-xs text-center text-gray-500">
            Guest users have limited access. Sign up for full features.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
