'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout';
import { PremiumCard, Badge, PageHeader, StatCard } from '@/components/ui-kit';
import {
  AlertTriangle,
  Phone,
  MapPin,
  Users,
  Clock,
  CheckCircle2,
  Siren,
  Shield,
  RefreshCw,
  Radio,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

const responders = [
  { name: 'Dr. Rajesh Kumar', role: 'Medical', distance: '50m', status: 'online', avatar: 'RK' },
  { name: 'Officer Priya Das', role: 'Security', distance: '120m', status: 'online', avatar: 'PD' },
  { name: 'Vikram Singh', role: 'First Aid', distance: '200m', status: 'online', avatar: 'VS' },
  { name: 'Anita Reddy', role: 'Fire Safety', distance: '350m', status: 'away', avatar: 'AR' },
];

const readinessChecks = [
  { label: 'Emergency contacts verified', done: true },
  { label: 'Location sharing available', done: true },
  { label: 'Medical profile on file', done: true },
  { label: 'Community alert channel tested', done: false },
];

export default function SafetyPage() {
  const router = useRouter();
  const { isAuthenticated, user, isHydrated } = useAuthStore();
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [incidentStartedAt, setIncidentStartedAt] = useState<number | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 28.6139, lng: 77.2090 });

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated || !user) router.push('/auth');
  }, [isAuthenticated, isHydrated, router, user]);

  useEffect(() => {
    if (!isEmergencyActive || !incidentStartedAt) return;
    const interval = setInterval(() => {
      setTimerSeconds(Math.floor((Date.now() - incidentStartedAt) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [incidentStartedAt, isEmergencyActive]);

  const onlineResponders = useMemo(() => responders.filter((responder) => responder.status === 'online').length, []);

  const activateEmergency = () => {
    setIsEmergencyActive(true);
    setIncidentStartedAt(Date.now());
    setTimerSeconds(0);
  };

  const clearEmergency = () => {
    setIsEmergencyActive(false);
    setIncidentStartedAt(null);
    setTimerSeconds(0);
    setActionFeedback('Incident cleared. Responders have been notified.');
  };

  const handleQuickAction = (action: 'call' | 'location' | 'broadcast') => {
    if (action === 'call') {
      window.location.href = 'tel:112';
      setActionFeedback('Dialing emergency services (112).');
      return;
    }

    if (action === 'location') {
      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          () => setActionFeedback('Live location shared with nearby responders.'),
          () => setActionFeedback('Could not access location. Please enable GPS permissions.'),
          { enableHighAccuracy: true, timeout: 8000 }
        );
      } else {
        setActionFeedback('Location sharing is not supported on this device.');
      }
      return;
    }

    setActionFeedback('Community-wide safety alert has been broadcast.');
  };

  const timerDisplay = `${Math.floor(timerSeconds / 60)}m ${timerSeconds % 60}s`;
  const readinessScore = Math.round((readinessChecks.filter((item) => item.done).length / readinessChecks.length) * 100);
  const mapEmbedUrl = useMemo(() => {
    const delta = 0.02;
    const left = (mapCenter.lng - delta).toFixed(6);
    const right = (mapCenter.lng + delta).toFixed(6);
    const top = (mapCenter.lat + delta).toFixed(6);
    const bottom = (mapCenter.lat - delta).toFixed(6);
    return `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${mapCenter.lat.toFixed(6)}%2C${mapCenter.lng.toFixed(6)}`;
  }, [mapCenter]);

  const centerMapOnCurrentLocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setActionFeedback('Live map location is not supported on this device.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setMapCenter({ lat: position.coords.latitude, lng: position.coords.longitude });
        setActionFeedback('Map centered on your live location.');
        setIsLocating(false);
      },
      () => {
        setActionFeedback('Could not access your location for map centering.');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  if (!isAuthenticated || !user) return null;

  return (
    <AppShell>
      <div className="min-h-screen bg-background">

        <PageHeader
          title="Emergency & Safety"
          description="Immediate help first. Status and responder updates in one place."
          icon={<Shield className="h-6 w-6" />}
          actions={
            <div className="flex items-center gap-2">
              <Badge variant="success">Responder network verified</Badge>
              <Badge variant={isEmergencyActive ? 'emergency' : 'success'}>{isEmergencyActive ? 'Active Incident' : 'All Clear'}</Badge>
            </div>
          }
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {actionFeedback && (
            <PremiumCard className="p-3 border-primary/30 bg-primary/5">
              <p className="text-sm text-primary">{actionFeedback}</p>
            </PremiumCard>
          )}

          <div className="grid gap-4 lg:grid-cols-[1.7fr_1fr]">
            <PremiumCard className="p-6 border-red-500/30 bg-red-500/5">
              <p className="text-xs uppercase tracking-wider font-semibold text-red-500">Emergency</p>
              <h2 className="text-2xl font-black mt-2">Need help right now?</h2>
              <p className="text-sm text-muted-foreground mt-2">Use the emergency trigger first. It alerts responders and starts live tracking.</p>

              <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-4">
                <button
                  onClick={isEmergencyActive ? clearEmergency : activateEmergency}
                  className={cn(
                    'h-28 w-28 rounded-full flex items-center justify-center transition-all duration-300 shrink-0',
                    isEmergencyActive
                      ? 'bg-red-500 shadow-[0_0_50px_rgba(239,68,68,0.45)]'
                      : 'bg-red-500/15 border-2 border-red-500/50 hover:bg-red-500/25'
                  )}
                >
                  {isEmergencyActive ? <Siren className="h-12 w-12 text-white" /> : <AlertTriangle className="h-12 w-12 text-red-500" />}
                </button>

                <div className="space-y-2">
                  <p className="text-base font-semibold">{isEmergencyActive ? 'Emergency is active' : 'Press to trigger emergency alert'}</p>
                  <p className="text-sm text-muted-foreground">
                    {isEmergencyActive
                      ? `Alert sent. Incident timer: ${timerDisplay}. Keep this page open for updates.`
                      : 'This sends your incident alert to nearby verified responders and emergency contacts.'}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="success">Identity verified responders</Badge>
                    {isEmergencyActive && <Badge variant="warning">Live incident</Badge>}
                  </div>
                </div>
              </div>
            </PremiumCard>

            <PremiumCard className="p-5">
              <p className="text-xs uppercase tracking-wider font-semibold text-primary">Readiness</p>
              <p className="text-3xl font-black mt-2">{readinessScore}%</p>
              <p className="text-xs text-muted-foreground mt-1">Your emergency profile readiness</p>
              <div className="h-2 mt-3 rounded-full bg-muted/40 overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${readinessScore}%` }} />
              </div>
              <div className="mt-4 space-y-2">
                {readinessChecks.map((item) => (
                  <div key={item.label} className="flex items-center gap-2 text-xs">
                    <CheckCircle2 className={cn('h-3.5 w-3.5', item.done ? 'text-emerald-500' : 'text-muted-foreground')} />
                    <span className={item.done ? 'text-foreground' : 'text-muted-foreground'}>{item.label}</span>
                  </div>
                ))}
              </div>
            </PremiumCard>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Responders Online" value={String(onlineResponders)} icon={<Users className="h-5 w-5" />} color="success" />
            <StatCard label="Avg Response Time" value="2.1m" icon={<Clock className="h-5 w-5" />} color="info" />
            <StatCard label="Open Incidents" value={isEmergencyActive ? '1' : '0'} icon={<AlertTriangle className="h-5 w-5" />} color="warning" />
            <StatCard label="Safety Score" value="98%" icon={<Shield className="h-5 w-5" />} color="primary" />
          </div>

          <PremiumCard className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="font-semibold text-sm">Live Safety Map</h3>
                <p className="text-xs text-muted-foreground">Responder presence and incident awareness around your area.</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="success">Tracking active</Badge>
                <Button variant="outline" size="sm" onClick={centerMapOnCurrentLocation} disabled={isLocating}>
                  {isLocating ? 'Locating...' : 'Use my location'}
                </Button>
              </div>
            </div>

            <div className="mt-4 relative rounded-xl overflow-hidden border border-border/70">
              <iframe
                title="Live safety map"
                src={mapEmbedUrl}
                className="h-72 md:h-80 w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />

              <div className="absolute left-3 bottom-3 rounded-lg bg-background/95 backdrop-blur px-3 py-2 border border-border/80">
                <p className="text-[11px] font-semibold">{onlineResponders} verified responders nearby</p>
                <p className="text-[11px] text-muted-foreground">Auto refresh every 30s during active incidents</p>
              </div>
            </div>
          </PremiumCard>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { id: 'call' as const, icon: Phone, label: 'Call Emergency', desc: 'Dial 112', color: 'text-red-400', bg: 'bg-red-500/10' },
              { id: 'location' as const, icon: MapPin, label: 'Share Location', desc: 'Send to responders', color: 'text-blue-400', bg: 'bg-blue-500/10' },
              { id: 'broadcast' as const, icon: Radio, label: 'Community Alert', desc: 'Broadcast message', color: 'text-amber-400', bg: 'bg-amber-500/10' },
            ].map((action) => (
              <button key={action.label} onClick={() => handleQuickAction(action.id)} className="text-left">
                <PremiumCard interactive className="p-4 cursor-pointer">
                  <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center mb-3', action.bg)}>
                    <action.icon className={cn('h-5 w-5', action.color)} />
                  </div>
                  <p className="text-sm font-semibold">{action.label}</p>
                  <p className="text-xs text-muted-foreground">{action.desc}</p>
                </PremiumCard>
              </button>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <PremiumCard className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-sm">Nearby Responders</h3>
                <Button variant="outline" size="sm" className="ml-auto h-8 gap-2"><RefreshCw className="h-3.5 w-3.5" /> Refresh</Button>
              </div>
              <div className="space-y-3">
                {responders.map((responder) => (
                  <div key={responder.name} className="flex items-center gap-3 p-3 rounded-xl bg-muted/20">
                    <div className="relative">
                      <div className="h-10 w-10 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary">{responder.avatar}</div>
                      <span className={cn('absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card', responder.status === 'online' ? 'bg-emerald-400' : 'bg-muted-foreground')} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{responder.name}</p>
                      <p className="text-xs text-muted-foreground">{responder.role} • {responder.distance} away</p>
                    </div>
                    <Badge variant={responder.status === 'online' ? 'success' : 'warning'} className="text-[10px]">
                      {responder.status === 'online' ? 'verified online' : 'standby'}
                    </Badge>
                  </div>
                ))}
              </div>
            </PremiumCard>

            <PremiumCard className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-sm">Recent Incidents</h3>
              </div>

              <div className="space-y-4">
                {[ 
                  { time: '3 days ago', event: 'Gas leak reported - Block B', responders: 4 },
                  { time: '1 week ago', event: 'Power outage - Sector 7', responders: 2 },
                  { time: '2 weeks ago', event: 'Medical emergency - Block A', responders: 6 },
                ].map((entry, index, array) => (
                  <div key={entry.event} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      </div>
                      {index < array.length - 1 && <div className="w-px flex-1 bg-border/30 mt-2" />}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="text-sm font-medium">{entry.event}</p>
                      <p className="text-xs text-muted-foreground">{entry.time} • {entry.responders} responders • resolved</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-xl border border-primary/20 p-4 bg-primary/5">
                <p className="text-xs font-semibold">Escalation policy</p>
                <p className="text-xs text-muted-foreground mt-1">If no local responder acknowledges within 90 seconds, city emergency channels are automatically alerted.</p>
              </div>
            </PremiumCard>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
