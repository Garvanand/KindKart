import Link from 'next/link';

const footerLinks = [
  { href: '/help-center', label: 'Help Center' },
  { href: '/safety', label: 'Safety' },
  { href: '/requests', label: 'Community Requests' },
  { href: '/auth', label: 'Account' },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-background/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-7 pb-24 md:pb-7">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-foreground">KindKart Support Network</p>
            <p className="text-xs text-muted-foreground mt-1">Reliable neighborhood help, verified response flow, and transparent escalation.</p>
          </div>

          <nav className="flex flex-wrap items-center gap-3 md:gap-5">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-4 pt-4 border-t border-border/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="text-xs text-muted-foreground">Emergency helpline: 112</p>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} KindKart. Built for safer neighborhoods.</p>
        </div>
      </div>
    </footer>
  );
}
