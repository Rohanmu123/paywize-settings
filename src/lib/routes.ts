import { Bell, Building2, Clock, FileText, IdCard, Key, Landmark, Link, Lock, Send, ShieldCheck, Sparkles, Users, type LucideIcon } from "lucide-react";

export type NavItem = { label: string; href: string; icon: LucideIcon };
export type NavGroup = { label: string; items: NavItem[] };

export const ROUTES = {
  businessProfile: "/settings/business-profile",
  editBusinessDetails: "/settings/business-profile/edit",
  kyc: "/settings/kyc",
  team: "/settings/team",
  createRole: "/settings/team/roles/new",
  editMember: (id: string) => `/settings/team/members/${id}`,
  branding: "/settings/branding",
  billing: "/settings/billing",
  settlement: "/settings/settlement",
  paymentMethods: "/settings/payment-methods",
  payouts: "/settings/payouts",
  security: "/settings/security",
  loginHistory: "/settings/login-history",
  apiKeys: "/settings/api-keys",
  webhooks: "/settings/webhooks",
  domains: "/settings/domains",
  alerts: "/settings/alerts",
} as const;

/** "Settings nav" — groups and order exactly as in Figma. */
export const SETTINGS_NAV: NavGroup[] = [
  {
    label: "General",
    items: [
      { label: "Business profile", href: ROUTES.businessProfile, icon: Building2 },
      { label: "KYC & compliance", href: ROUTES.kyc, icon: ShieldCheck },
      { label: "Team & roles", href: ROUTES.team, icon: Users },
      { label: "Branding", href: ROUTES.branding, icon: Sparkles },
      { label: "Billing & invoices", href: ROUTES.billing, icon: FileText },
    ],
  },
  {
    label: "Payment",
    items: [
      { label: "Settlement account", href: ROUTES.settlement, icon: Landmark },
      { label: "Payment methods & limits", href: ROUTES.paymentMethods, icon: IdCard },
    ],
  },
  {
    label: "Security & sign-in",
    items: [
      { label: "Security", href: ROUTES.security, icon: Lock },
      { label: "Login & history", href: ROUTES.loginHistory, icon: Clock },
    ],
  },
  {
    label: "Developers",
    items: [
      { label: "API keys", href: ROUTES.apiKeys, icon: Key },
      { label: "Webhooks", href: ROUTES.webhooks, icon: Send },
      { label: "Domains & URLs", href: ROUTES.domains, icon: Link },
    ],
  },
  {
    label: "Notifications",
    items: [{ label: "Alerts & recipients", href: ROUTES.alerts, icon: Bell }],
  },
];

/** Which nav item is active for a pathname (sub-pages light up their parent). */
export function activeNavHref(pathname: string): string | null {
  const all = SETTINGS_NAV.flatMap((g) => g.items.map((i) => i.href));
  const match = all.filter((h) => pathname === h || pathname.startsWith(h + "/")).sort((a, b) => b.length - a.length)[0];
  return match ?? null;
}
