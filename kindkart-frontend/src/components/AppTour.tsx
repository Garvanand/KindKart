'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, ArrowRight, ArrowLeft, Home, Users, MessageCircle, Wallet, Trophy, HelpCircle, Sparkles, Settings } from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  route?: string; // Route to navigate to
  pageSpecific?: boolean; // If true, only show on this page
}

const globalTourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to KindKart! 🎉',
    description: 'Your neighborhood community platform. Let\'s take a quick tour to get you started.',
    icon: <Home className="w-8 h-8 text-blue-600" />,
  },
];

const pageSpecificTours: Record<string, TourStep[]> = {
  '/dashboard': [
    {
      id: 'dashboard-overview',
      title: 'Your Dashboard',
      description: 'This is your home base. Here you can see all your communities, requests, and quick actions.',
      icon: <Home className="w-8 h-8 text-blue-600" />,
      pageSpecific: true,
    },
  ],
  '/communities/join': [
    {
      id: 'join-community',
      title: 'Join a Community',
      description: 'Enter an invite code to join an existing community. Each community has a unique 6-character code.',
      icon: <Users className="w-8 h-8 text-purple-600" />,
      pageSpecific: true,
    },
  ],
  '/communities/create': [
    {
      id: 'create-community',
      title: 'Create Your Community',
      description: 'Start your own neighborhood community. You\'ll become the admin and can invite neighbors with a unique code.',
      icon: <Sparkles className="w-8 h-8 text-green-600" />,
      pageSpecific: true,
    },
  ],
};

export function AppTour() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [tourSteps, setTourSteps] = useState<TourStep[]>(globalTourSteps);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check if user has seen the tour for this page
    const tourKey = `kindkart-tour-${pathname}`;
    const hasSeenTour = localStorage.getItem(tourKey);
    const hasSeenGlobalTour = localStorage.getItem('kindkart-tour-global');
    
    // Get page-specific tour if available
    const pageTour = pageSpecificTours[pathname];
    
    if (pageTour && !hasSeenTour) {
      setTourSteps(pageTour);
      setIsOpen(true);
    } else if (!hasSeenGlobalTour && pathname === '/dashboard') {
      setTourSteps(globalTourSteps);
      setIsOpen(true);
    }
  }, [pathname]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      const nextStep = tourSteps[currentStep + 1];
      if (nextStep.route && nextStep.route !== pathname) {
        router.push(nextStep.route);
      }
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      const prevStep = tourSteps[currentStep - 1];
      if (prevStep.route && prevStep.route !== pathname) {
        router.push(prevStep.route);
      }
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    const tourKey = `kindkart-tour-${pathname}`;
    localStorage.setItem(tourKey, 'true');
    if (tourSteps === globalTourSteps) {
      localStorage.setItem('kindkart-tour-global', 'true');
    }
    setIsOpen(false);
  };

  if (!isOpen) return null;

  const step = tourSteps[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === tourSteps.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md animate-in fade-in zoom-in-95 shadow-2xl border-2 border-primary/20">
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4"
            onClick={handleSkip}
          >
            <X className="w-4 h-4" />
          </Button>
          <div className="flex items-center justify-center mb-4">
            {step.icon}
          </div>
          <CardTitle className="text-center text-2xl">{step.title}</CardTitle>
          <CardDescription className="text-center text-base">
            {step.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress indicator */}
          <div className="flex justify-center gap-2">
            {tourSteps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === currentStep
                    ? 'w-8 bg-primary'
                    : index < currentStep
                    ? 'w-2 bg-primary/50'
                    : 'w-2 bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex gap-2">
            {!isFirst && (
              <Button
                variant="outline"
                onClick={handlePrevious}
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
            )}
            <Button
              onClick={handleNext}
              className={isFirst ? 'w-full gradient-primary text-white' : 'flex-1 gradient-primary text-white'}
            >
              {isLast ? 'Got it!' : 'Next'}
              {!isLast && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          </div>

          {/* Skip button */}
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="w-full text-sm text-gray-500"
          >
            Skip Tour
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
