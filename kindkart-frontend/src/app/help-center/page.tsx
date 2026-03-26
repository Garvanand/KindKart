'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '@/components/layout';
import { PremiumCard, PageHeader, Badge } from '@/components/ui-kit';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/ui/toast';
import { LifeBuoy, Phone, Mail, MessageCircle, Copy, CheckCircle2 } from 'lucide-react';

type TicketCategory = 'account' | 'safety' | 'payment' | 'community' | 'other';

export default function HelpCenterPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { isAuthenticated, isHydrated, user } = useAuthStore();

  const [category, setCategory] = useState<TicketCategory>('account');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated || !user) {
      router.push('/auth');
    }
  }, [isAuthenticated, isHydrated, router, user]);

  const copyField = async (value: string, fieldName: string) => {
    if (!value) {
      showToast(`${fieldName} is not available yet.`, 'warning');
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      showToast(`${fieldName} copied.`, 'success');
    } catch {
      showToast(`Could not copy ${fieldName.toLowerCase()}.`, 'error');
    }
  };

  const handleSubmitTicket = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!subject.trim() || !message.trim()) {
      showToast('Please fill subject and message before submitting.', 'warning');
      return;
    }

    setIsSubmitting(true);

    const userDetails = [
      `Name: ${user?.name || 'N/A'}`,
      `Email: ${user?.email || 'N/A'}`,
      `Phone: ${user?.phone || 'N/A'}`,
      `User ID: ${user?.id || 'N/A'}`,
    ].join('\n');

    const body = encodeURIComponent(`${message.trim()}\n\n---\n${userDetails}`);
    const mailto = `mailto:support@kindkart.app?subject=${encodeURIComponent(`[${category.toUpperCase()}] ${subject.trim()}`)}&body=${body}`;

    window.location.href = mailto;
    showToast('Ticket draft opened in your mail app with your details attached.', 'success');

    setTimeout(() => {
      setIsSubmitting(false);
    }, 400);
  };

  if (!isAuthenticated || !user) return null;

  return (
    <AppShell>
      <div className="min-h-screen bg-background">
        <PageHeader
          title="Help Center"
          description="Get support fast, with your profile details pre-attached for quicker resolution."
          icon={<LifeBuoy className="h-6 w-6" />}
          actions={<Badge variant="success">Support online</Badge>}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <a href="tel:112" className="block">
              <PremiumCard interactive className="p-4 h-full">
                <Phone className="h-5 w-5 text-red-500" />
                <p className="mt-3 text-sm font-semibold">Emergency Call</p>
                <p className="text-xs text-muted-foreground">Dial 112 immediately for urgent help.</p>
              </PremiumCard>
            </a>

            <a href="mailto:support@kindkart.app" className="block">
              <PremiumCard interactive className="p-4 h-full">
                <Mail className="h-5 w-5 text-blue-500" />
                <p className="mt-3 text-sm font-semibold">Email Support</p>
                <p className="text-xs text-muted-foreground">support@kindkart.app</p>
              </PremiumCard>
            </a>

            <Link href="/chat" className="block">
              <PremiumCard interactive className="p-4 h-full">
                <MessageCircle className="h-5 w-5 text-emerald-500" />
                <p className="mt-3 text-sm font-semibold">Community Chat Help</p>
                <p className="text-xs text-muted-foreground">Open chat and ask for neighbor assistance.</p>
              </PremiumCard>
            </Link>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <PremiumCard className="p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold">Your Details</h2>
                <Badge variant={user.isVerified ? 'success' : 'warning'}>{user.isVerified ? 'Verified profile' : 'Unverified profile'}</Badge>
              </div>

              <div className="mt-4 space-y-3">
                <DetailRow label="Full name" value={user.name} onCopy={() => copyField(user.name || '', 'Name')} />
                <DetailRow label="Email" value={user.email || 'Not set'} onCopy={() => copyField(user.email || '', 'Email')} />
                <DetailRow label="Phone" value={user.phone || 'Not set'} onCopy={() => copyField(user.phone || '', 'Phone')} />
                <DetailRow label="User ID" value={user.id} onCopy={() => copyField(user.id, 'User ID')} />
              </div>

              <p className="mt-4 text-xs text-muted-foreground">
                These details are included automatically when you submit a support ticket.
              </p>
            </PremiumCard>

            <PremiumCard className="p-5">
              <h2 className="text-base font-semibold">Submit Support Ticket</h2>
              <p className="text-xs text-muted-foreground mt-1">This opens your email app with a pre-filled support draft.</p>

              <form className="mt-4 space-y-3" onSubmit={handleSubmitTicket}>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Category</label>
                  <select
                    value={category}
                    onChange={(event) => setCategory(event.target.value as TicketCategory)}
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="account">Account</option>
                    <option value="safety">Safety</option>
                    <option value="payment">Payment</option>
                    <option value="community">Community</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Subject</label>
                  <Input
                    value={subject}
                    onChange={(event) => setSubject(event.target.value)}
                    placeholder="Example: Unable to verify phone number"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Message</label>
                  <Textarea
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    rows={5}
                    placeholder="Describe the issue and what you already tried."
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Preparing Ticket...' : 'Submit Ticket'}
                </Button>
              </form>
            </PremiumCard>
          </div>

          <PremiumCard className="p-5">
            <h3 className="text-sm font-semibold">Quick FAQs</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <FaqItem
                question="How quickly does support respond?"
                answer="Critical safety issues are prioritized immediately. General tickets are usually addressed within a few hours."
              />
              <FaqItem
                question="Can I update my details before raising a ticket?"
                answer="Yes. Update your profile in settings, then open Help Center again so the latest details are attached."
              />
              <FaqItem
                question="What if I cannot access email?"
                answer="Use Emergency Call for urgent matters and Community Chat Help for immediate local coordination."
              />
              <FaqItem
                question="Is my profile data secure?"
                answer="Only essential data required for support resolution is included in the generated ticket draft."
              />
            </div>
          </PremiumCard>
        </div>
      </div>
    </AppShell>
  );
}

function DetailRow({
  label,
  value,
  onCopy,
}: {
  label: string;
  value: string;
  onCopy: () => void;
}) {
  return (
    <div className="rounded-lg border border-border/70 px-3 py-2.5 flex items-center justify-between gap-3">
      <div>
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="text-sm font-medium mt-1 break-all">{value}</p>
      </div>
      <Button type="button" variant="outline" size="sm" onClick={onCopy} className="shrink-0">
        <Copy className="h-3.5 w-3.5 mr-1.5" />
        Copy
      </Button>
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="rounded-lg border border-border/70 p-3">
      <p className="text-sm font-medium flex items-start gap-2">
        <CheckCircle2 className="h-4 w-4 mt-0.5 text-emerald-500" />
        {question}
      </p>
      <p className="mt-1.5 text-xs text-muted-foreground">{answer}</p>
    </div>
  );
}
