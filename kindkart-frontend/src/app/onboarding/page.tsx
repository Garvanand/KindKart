'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PremiumCard, Badge } from '@/components/ui-kit';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Users, Wrench, Clock, User, ChevronRight, ChevronLeft, CheckCircle2, MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';

const steps = [
  { id: 'community', label: 'Community', icon: Users },
  { id: 'skills', label: 'Skills', icon: Wrench },
  { id: 'availability', label: 'Availability', icon: Clock },
  { id: 'profile', label: 'Profile', icon: User },
];

const skillOptions = [
  'Plumbing', 'Electrical', 'Carpentry', 'Painting', 'Cooking', 'Tutoring',
  'Pet Care', 'Gardening', 'IT Support', 'First Aid', 'Driving', 'Cleaning',
  'Photography', 'Music', 'Fitness', 'Legal Advice',
];

const availabilityOptions = ['Mornings', 'Afternoons', 'Evenings', 'Weekends', 'Flexible', 'Emergency Only'];

type UserCommunity = { id: string; name: string };

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isAuthenticated, isHydrated, setUser } = useAuthStore();

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());
  const [selectedAvailability, setSelectedAvailability] = useState<Set<string>>(new Set());
  const [communityCode, setCommunityCode] = useState('');
  const [joinedCommunityId, setJoinedCommunityId] = useState('');
  const [communities, setCommunities] = useState<UserCommunity[]>([]);

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [qualification, setQualification] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated || !user) {
      router.push('/auth');
      return;
    }

    setName(user.name || '');
    void loadCommunities();
  }, [isAuthenticated, isHydrated, router, user]);

  const loadCommunities = async () => {
    try {
      setIsLoading(true);
      const response = await api.users.getCommunities();
      const list = Array.isArray(response) ? response : (response as any)?.communities || [];
      setCommunities(list);
      if (list.length > 0) setJoinedCommunityId(String(list[0].id));
    } catch {
      setCommunities([]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) => {
      const next = new Set(prev);
      if (next.has(skill)) next.delete(skill);
      else next.add(skill);
      return next;
    });
  };

  const toggleAvailability = (slot: string) => {
    setSelectedAvailability((prev) => {
      const next = new Set(prev);
      if (next.has(slot)) next.delete(slot);
      else next.add(slot);
      return next;
    });
  };

  const stepError = useMemo(() => {
    if (currentStep === 0 && !joinedCommunityId && !communityCode.trim()) return 'Join or select at least one community.';
    if (currentStep === 1 && selectedSkills.size === 0) return 'Choose at least one skill so we can match requests.';
    if (currentStep === 2 && selectedAvailability.size === 0) return 'Choose at least one time window.';
    if (currentStep === 3 && !name.trim()) return 'Display name is required.';
    return null;
  }, [communityCode, currentStep, joinedCommunityId, name, selectedAvailability.size, selectedSkills.size]);

  const joinWithInviteCode = async () => {
    if (!communityCode.trim()) return;
    setError(null);
    setIsSubmitting(true);
    try {
      const response = await api.communities.join(communityCode.trim());
      const joinedId = (response as any)?.community?.id || (response as any)?.id;
      if (joinedId) {
        setJoinedCommunityId(String(joinedId));
        await loadCommunities();
        setCommunityCode('');
      }
    } catch (joinError: any) {
      setError(joinError?.message || 'Invalid invite code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const next = () => {
    setError(null);
    if (stepError) {
      setError(stepError);
      return;
    }
    if (currentStep < steps.length - 1) setCurrentStep((s) => s + 1);
  };

  const back = () => {
    setError(null);
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  const finishOnboarding = async () => {
    if (!user) return;
    setError(null);

    if (stepError) {
      setError(stepError);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        age: age.trim() ? Number(age) : undefined,
        qualification: qualification.trim() || Array.from(selectedAvailability).join(', '),
        certifications: Array.from(selectedSkills),
      };

      const response = await api.users.updateProfile(payload);
      const updatedUser = (response as any)?.user || { ...user, ...payload };
      setUser(updatedUser);
      router.push('/dashboard');
    } catch (submitError: any) {
      setError(submitError?.message || 'Could not save your onboarding details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated || !user) return null;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-mesh-1 opacity-18" />
      <motion.div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]" animate={{ y: [0, 20, 0] }} transition={{ duration: 8, repeat: Infinity }} />

      <div className="relative max-w-3xl mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Set up your KindKart profile</h1>
          <p className="text-muted-foreground text-sm">A quick setup helps us match you with relevant neighbors and requests.</p>
        </motion.div>

        <div className="flex items-center gap-2 mb-8">
          {steps.map((step, i) => (
            <div key={step.id} className="flex items-center flex-1">
              <div
                className={cn(
                  'h-9 w-9 rounded-lg flex items-center justify-center text-xs font-bold transition-all flex-shrink-0',
                  i <= currentStep ? 'bg-primary text-primary-foreground' : 'bg-muted/40 text-muted-foreground'
                )}
              >
                {i < currentStep ? <CheckCircle2 className="h-4 w-4" /> : <step.icon className="h-4 w-4" />}
              </div>
              {i < steps.length - 1 && <div className={cn('flex-1 h-px mx-2', i < currentStep ? 'bg-primary/50' : 'bg-border/30')} />}
            </div>
          ))}
        </div>

        <PremiumCard className="p-6 sm:p-8">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-300/30">
              <p className="text-xs text-rose-300">{error}</p>
            </div>
          )}

          <AnimatePresence mode="wait">
            {currentStep === 0 && (
              <motion.div key="community" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-lg font-bold mb-2">Join your community</h2>
                <p className="text-sm text-muted-foreground mb-6">Use an invite code or continue with one of your memberships.</p>

                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    placeholder="Invite code (example: ABC123)"
                    value={communityCode}
                    onChange={(e) => setCommunityCode(e.target.value)}
                    className="input-premium flex-1"
                  />
                  <Button onClick={joinWithInviteCode} disabled={!communityCode.trim() || isSubmitting}>
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Join'}
                  </Button>
                </div>

                <div className="space-y-2">
                  {isLoading ? (
                    <div className="h-20 rounded-xl bg-muted/20 animate-pulse" />
                  ) : communities.length === 0 ? (
                    <div className="p-4 rounded-xl bg-muted/20 text-xs text-muted-foreground">
                      No linked communities yet. You can continue after joining with an invite code.
                    </div>
                  ) : (
                    communities.map((community) => {
                      const selected = String(community.id) === joinedCommunityId;
                      return (
                        <button
                          key={community.id}
                          onClick={() => setJoinedCommunityId(String(community.id))}
                          className={cn(
                            'w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left border',
                            selected ? 'bg-primary/10 border-primary/30' : 'bg-muted/20 hover:bg-muted/40 border-border/20'
                          )}
                        >
                          <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{community.name}</p>
                            <p className="text-xs text-muted-foreground">Verified neighborhood</p>
                          </div>
                          {selected && <Badge variant="primary" className="text-[10px]">Selected</Badge>}
                        </button>
                      );
                    })
                  )}
                </div>
              </motion.div>
            )}

            {currentStep === 1 && (
              <motion.div key="skills" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-lg font-bold mb-2">What can you help with?</h2>
                <p className="text-sm text-muted-foreground mb-6">Select your skills ({selectedSkills.size} selected)</p>
                <div className="flex flex-wrap gap-2">
                  {skillOptions.map((skill) => (
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
                <h2 className="text-lg font-bold mb-2">When are you usually available?</h2>
                <p className="text-sm text-muted-foreground mb-6">Pick one or more time windows.</p>
                <div className="space-y-2">
                  {availabilityOptions.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => toggleAvailability(slot)}
                      className={cn(
                        'w-full flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition-all text-left border',
                        selectedAvailability.has(slot)
                          ? 'bg-primary/15 text-primary border-primary/30'
                          : 'bg-muted/20 text-muted-foreground hover:bg-muted/40 border-transparent'
                      )}
                    >
                      <Clock className="h-4 w-4 flex-shrink-0" />
                      {slot}
                      {selectedAvailability.has(slot) && <CheckCircle2 className="h-4 w-4 ml-auto" />}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-lg font-bold mb-2">Complete your profile</h2>
                <p className="text-sm text-muted-foreground mb-6">This helps neighbors trust and identify your expertise.</p>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Display name</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="input-premium w-full" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Age</label>
                      <input value={age} onChange={(e) => setAge(e.target.value)} placeholder="Optional" className="input-premium w-full" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Qualification</label>
                      <input
                        value={qualification}
                        onChange={(e) => setQualification(e.target.value)}
                        placeholder="Optional"
                        className="input-premium w-full"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-6 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                  <p className="text-sm font-medium text-emerald-400 mb-1">Ready to launch</p>
                  <p className="text-xs text-muted-foreground">We will save your profile and take you to your dashboard.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/30">
            <Button variant="ghost" size="sm" onClick={back} disabled={currentStep === 0 || isSubmitting}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <div className="text-xs text-muted-foreground">Step {currentStep + 1} of {steps.length}</div>
            {currentStep === steps.length - 1 ? (
              <Button size="sm" onClick={finishOnboarding} disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
                Finish <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button size="sm" onClick={next} disabled={isSubmitting}>
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </PremiumCard>
      </div>
    </div>
  );
}
