'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Play, CheckCircle, Star, Users, Award } from 'lucide-react';
import { PremiumCard, FeatureCard } from '@/components/ui-kit/cards';
import { Badge, AnimatedBadge } from '@/components/ui-kit/badges';
import { cn } from '@/lib/utils';

/**
 * PremiumDemoBanner - Eye-catching demo mode banner at the top
 */
export interface PremiumDemoBannerProps {
  onCloseDemoClick?: () => void;
  onStartTourClick?: () => void;
}

export function PremiumDemoBanner({ onCloseDemoClick, onStartTourClick }: PremiumDemoBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed top-16 left-0 right-0 z-30"
    >
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-primary/20 via-purple-500/10 to-primary/20 border border-primary/30 rounded-xl p-4 flex items-center justify-between gap-4 backdrop-blur-sm">
          {/* Left content */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white flex-shrink-0"
            >
              <Zap className="h-5 w-5" />
            </motion.div>
            <div className="min-w-0">
              <p className="font-semibold text-foreground text-sm">DEMO MODE ACTIVE</p>
              <p className="text-xs text-muted-foreground">Experience all premium features risk-free. Data will reset on page reload.</p>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {onStartTourClick && (
              <motion.button
                onClick={onStartTourClick}
                className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Tour
              </motion.button>
            )}
            {onCloseDemoClick && (
              <motion.button
                onClick={onCloseDemoClick}
                className="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground"
                whileHover={{ scale: 1.1 }}
              >
                ✕
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * DemoFeatureShowcase - Beautiful showcase of available demo features
 */
export interface DemoFeature {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  duration?: string;
  onClick?: () => void;
}

export interface DemoFeatureShowcaseProps {
  features: DemoFeature[];
  title?: string;
}

export function DemoFeatureShowcase({ features, title = "Try Premium Features" }: DemoFeatureShowcaseProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="py-12"
    >
      {title && (
        <h2 className="text-3xl font-bold text-foreground mb-8 text-center">{title}</h2>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, idx) => (
          <motion.div
            key={feature.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1, duration: 0.3 }}
            onClick={feature.onClick}
          >
            <FeatureCard
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              badge={feature.duration}
              action={feature.onClick ? { label: 'Try Demo', onClick: feature.onClick } : undefined}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

/**
 * DemoGuideStep - Step in the demo guide
 */
export interface DemoGuideStepProps {
  step: number;
  totalSteps: number;
  title: string;
  description: string;
  image?: string;
  tips?: string[];
  onNext?: () => void;
  onPrevious?: () => void;
  onSkip?: () => void;
}

export function DemoGuideStep({
  step,
  totalSteps,
  title,
  description,
  image,
  tips,
  onNext,
  onPrevious,
  onSkip,
}: DemoGuideStepProps) {
  const progress = (step / totalSteps) * 100;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={step}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* Progress bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-foreground">
              Step {step} of {totalSteps}
            </span>
            <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Content */}
        <PremiumCard elevated>
          <div className="space-y-4">
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-2">{title}</h3>
              <p className="text-base text-muted-foreground">{description}</p>
            </div>

            {image && (
              <div className="w-full rounded-lg overflow-hidden bg-muted h-64 flex items-center justify-center">
                <img src={image} alt={title} className="w-full h-full object-cover" />
              </div>
            )}

            {tips && tips.length > 0 && (
              <div className="space-y-2 p-4 rounded-lg bg-info/10 border border-info/30">
                <p className="font-semibold text-sm text-info">💡 Tips:</p>
                {tips.map((tip, idx) => (
                  <p key={idx} className="text-sm text-info/80">• {tip}</p>
                ))}
              </div>
            )}
          </div>
        </PremiumCard>

        {/* Actions */}
        <div className="flex items-center justify-between gap-4">
          <motion.button
            onClick={onSkip}
            className="px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground font-medium text-sm transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Skip
          </motion.button>

          <div className="flex items-center gap-3">
            {step > 1 && onPrevious && (
              <motion.button
                onClick={onPrevious}
                className="px-4 py-2 rounded-lg border border-border bg-background hover:bg-muted font-semibold text-sm transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                ← Previous
              </motion.button>
            )}
            {onNext && (
              <motion.button
                onClick={onNext}
                className={cn(
                  'px-6 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-2',
                  step === totalSteps
                    ? 'bg-success text-white hover:bg-emerald-600'
                    : 'bg-primary text-primary-foreground hover:bg-primary-dark'
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {step === totalSteps ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Complete
                  </>
                ) : (
                  <>
                    Next →
                  </>
                )}
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * TourCompletionCelebration - Celebration animation when tour is completed
 */
export interface TourCompletionCelebrationProps {
  onClose?: () => void;
  onViewProfile?: () => void;
}

export function TourCompletionCelebration({ onClose, onViewProfile }: TourCompletionCelebrationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
      />

      {/* Celebration card */}
      <motion.div className="relative bg-card rounded-2xl p-8 max-w-md border border-primary/30 shadow-2xl">
        {/* Confetti animation */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: ['bg-primary', 'bg-success', 'bg-warning'][i % 3],
              left: `${Math.random() * 100}%`,
              top: '-10px',
            }}
            animate={{ y: 400, opacity: 0 }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.05 }}
          />
        ))}

        {/* Content */}
        <div className="relative text-center space-y-4">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="text-6xl"
          >
            🎉
          </motion.div>

          <div>
            <h3 className="text-2xl font-bold text-foreground mb-2">Tour Complete!</h3>
            <p className="text-muted-foreground">
              You've unlocked all premium features. Ready to get started?
            </p>
          </div>

          <AnimatedBadge variant="success" unlocked>
            <Award className="h-4 w-4" />
            Tour Master Badge Unlocked
          </AnimatedBadge>

          <div className="flex gap-3 pt-4">
            {onViewProfile && (
              <motion.button
                onClick={onViewProfile}
                className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View Profile
              </motion.button>
            )}
            {onClose && (
              <motion.button
                onClick={onClose}
                className="flex-1 px-4 py-2 rounded-lg border border-border hover:bg-muted font-semibold transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Close
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
