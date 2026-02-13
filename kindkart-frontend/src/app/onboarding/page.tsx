'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PremiumCard, Badge } from '@/components/ui-kit';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Users, Wrench, Clock, User, ChevronRight, ChevronLeft, CheckCircle2, MapPin, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const steps = [
  { id: 'community', label: 'Community', icon: Users },
  { id: 'skills', label: 'Skills', icon: Wrench },
  { id: 'availability', label: 'Availability', icon: Clock },
  { id: 'profile', label: 'Profile', icon: User },
];

const skills = [
  'Plumbing', 'Electrical', 'Carpentry', 'Painting', 'Cooking', 'Tutoring',
  'Pet Care', 'Gardening', 'IT Support', 'First Aid', 'Driving', 'Cleaning',
  'Photography', 'Music', 'Fitness', 'Legal Advice',
];

const availability = ['Mornings (6AM-12PM)', 'Afternoons (12PM-5PM)', 'Evenings (5PM-10PM)', 'Weekends Only', 'Flexible / Anytime', 'Emergency Only'];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());
  const [selectedAvailability, setSelectedAvailability] = useState<Set<string>>(new Set());
  const [communityCode, setCommunityCode] = useState('');

  const toggleSkill = (s: string) => {
    setSelectedSkills(prev => { const n = new Set(prev); if (n.has(s)) n.delete(s); else n.add(s); return n; });
  };
  const toggleAvail = (a: string) => {
    setSelectedAvailability(prev => { const n = new Set(prev); if (n.has(a)) n.delete(a); else n.add(a); return n; });
  };

  const next = () => {
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
    else router.push('/dashboard');
  };
  const back = () => { if (currentStep > 0) setCurrentStep(currentStep - 1); };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-mesh-1 opacity-30" />
      <motion.div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]" animate={{ y: [0, 20, 0] }} transition={{ duration: 8, repeat: Infinity }} />

      <div className="relative max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Welcome to KindKart</h1>
          <p className="text-muted-foreground text-sm">Let&apos;s set up your neighborhood profile</p>
        </motion.div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((step, i) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className={cn(
                'h-9 w-9 rounded-lg flex items-center justify-center text-xs font-bold transition-all flex-shrink-0',
                i <= currentStep ? 'bg-primary text-primary-foreground' : 'bg-muted/40 text-muted-foreground'
              )}>
                {i < currentStep ? <CheckCircle2 className="h-4 w-4" /> : <step.icon className="h-4 w-4" />}
              </div>
              {i < steps.length - 1 && <div className={cn('flex-1 h-px mx-2', i < currentStep ? 'bg-primary/50' : 'bg-border/30')} />}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <PremiumCard className="p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {currentStep === 0 && (
              <motion.div key="community" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-lg font-bold mb-2">Join Your Community</h2>
                <p className="text-sm text-muted-foreground mb-6">Enter an invite code or browse nearby communities</p>
                <input
                  type="text"
                  placeholder="Enter invite code (e.g., ABC123)"
                  value={communityCode}
                  onChange={e => setCommunityCode(e.target.value)}
                  className="input-premium w-full mb-4"
                />
                <div className="text-center text-xs text-muted-foreground mb-4">or</div>
                <div className="space-y-2">
                  {['Sunrise Apartments', 'Green Valley Society', 'Metro Heights'].map(name => (
                    <button key={name} className="w-full flex items-center gap-3 p-3 rounded-xl bg-muted/20 hover:bg-muted/40 transition-colors text-left">
                      <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{name}</p>
                        <p className="text-xs text-muted-foreground">Nearby &middot; 200+ members</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {currentStep === 1 && (
              <motion.div key="skills" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-lg font-bold mb-2">What can you help with?</h2>
                <p className="text-sm text-muted-foreground mb-6">Select skills to match with requests ({selectedSkills.size} selected)</p>
                <div className="flex flex-wrap gap-2">
                  {skills.map(skill => (
                    <button
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className={cn(
                        'px-3 py-2 rounded-xl text-sm font-medium transition-all',
                        selectedSkills.has(skill) ? 'bg-primary text-primary-foreground' : 'bg-muted/30 text-muted-foreground hover:bg-muted/60'
                      )}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div key="availability" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-lg font-bold mb-2">When are you available?</h2>
                <p className="text-sm text-muted-foreground mb-6">Help us match you at the right time</p>
                <div className="space-y-2">
                  {availability.map(a => (
                    <button
                      key={a}
                      onClick={() => toggleAvail(a)}
                      className={cn(
                        'w-full flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition-all text-left',
                        selectedAvailability.has(a) ? 'bg-primary/15 text-primary border border-primary/30' : 'bg-muted/20 text-muted-foreground hover:bg-muted/40 border border-transparent'
                      )}
                    >
                      <Clock className="h-4 w-4 flex-shrink-0" />
                      {a}
                      {selectedAvailability.has(a) && <CheckCircle2 className="h-4 w-4 ml-auto" />}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-lg font-bold mb-2">Complete Your Profile</h2>
                <p className="text-sm text-muted-foreground mb-6">Build trust with your community</p>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Display Name</label>
                    <input type="text" placeholder="Your name" className="input-premium w-full" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">About You</label>
                    <textarea placeholder="Tell your neighbors a bit about yourself..." className="input-premium w-full h-20 resize-none" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Block / Flat Number</label>
                    <input type="text" placeholder="e.g., Block A, Flat 301" className="input-premium w-full" />
                  </div>
                </div>
                <div className="mt-6 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                  <p className="text-sm font-medium text-emerald-400 mb-1">You&apos;re all set!</p>
                  <p className="text-xs text-muted-foreground">Click finish to start exploring your neighborhood.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/30">
            <Button variant="ghost" size="sm" onClick={back} disabled={currentStep === 0}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <div className="text-xs text-muted-foreground">Step {currentStep + 1} of {steps.length}</div>
            <Button size="sm" onClick={next}>
              {currentStep === steps.length - 1 ? 'Finish' : 'Next'} <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </PremiumCard>
      </div>
    </div>
  );
}
