# Paywize Merchant v2 · Settings

A Next.js build of the **PG · Merchant v2** Figma file (Settings v2.2-B screens and Pop-up v2.4-B overlays). It covers every settings screen and every prototype interaction. Data comes from in-memory mock services, so the app runs without a backend.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000 (redirects to /settings/business-profile)
npm run build && npm start
npm run lint
npx tsc --noEmit
```

Requires Node 20 or newer.

## Stack

- Next.js 15 (App Router, `src/` directory) with React 19 and TypeScript (strict).
- Tailwind CSS v4. The Figma variables are defined as `@theme` tokens in `src/app/globals.css`. Colours, radii and type styles such as `type-14sb` and `type-12r` match the Figma names.
- Figtree from `@fontsource/figtree`.
- lucide-react for every icon. The Figma icons are Lucide at stroke 1.5, so `Icon` wraps them with `absoluteStrokeWidth`.

## Folder structure

```
src/
  app/                     Routes only. Each page.tsx sets metadata and renders a feature view.
  components/
    layout/                App shell: TopNav, Sidebar, SettingsNav, PageHeader, ServiceScope, SaveBar
    ui/                    Design-system primitives (Button, Chip, Alert, Card, DataTable, Modal,
                           OtpModal, TextField, Select, Switch, Checkbox, Radio, OptionCard, Toast …)
  features/<screen>/       One folder per screen: <Screen>View.tsx and <Screen>Modals.tsx
  data/                    Typed seed data and constants taken from the design
  services/                Mock async services (createStore and delay). Swap these for real API calls.
  lib/                     routes, format, validation, store, useModal, cn
```

### Conventions

- **Pop-ups live in the URL.** `useModal()` writes `?modal=<name>&id=<id>`, so every Figma pop-up frame can be deep-linked, survives a refresh and works with the browser's Back button. Example: `/settings/api-keys?modal=view&id=pw_live_9fK2mQ4xR7Qa`.
- **State** goes through `createStore` and `useStore` (built on `useSyncExternalStore`). Each service file owns one store and exposes async actions.
- **Toasts** are the six "Toast / …" overlays from the file: changes-saved, request-submitted, download-started, invitation-sent, signed-out and link-sent.
- **OTP.** The mock accepts any 6-digit code except `000000`.

## Route map

| Route | Screen | Pop-ups and flows |
|---|---|---|
| `/settings/business-profile` | Business profile | Edit business details, edit contact (OTP), transfer ownership (OTP), close account (OTP), raise change request |
| `/settings/business-profile/edit` | Edit business details | Public details, address and contact form with validation |
| `/settings/kyc` | KYC & compliance | Upload document, view document |
| `/settings/team` | Team & roles | Invite member, view role, filter chips |
| `/settings/team/roles/new` | Create custom role | Permissions matrix, service access, save bar |
| `/settings/team/members/[id]` | Edit member | Reset 2FA, suspend or restore, remove (with acknowledgement) |
| `/settings/branding` | Branding | Logo upload, colour picker, method order (drag or arrow keys), live checkout preview, discard |
| `/settings/billing` | Billing & invoices | Talk to account manager, invoice drawer (details and payments, email, download) |
| `/settings/settlement` | Settlement account | View bank, add bank, cancel change request, view cheque, fix & retry, edit schedule, pause (OTP) |
| `/settings/payment-methods` | Payment methods & limits | Request access, limit increase, cancel limit request, international cards |
| `/settings/payouts` | Payouts (inactive) | Request activation, go to KYC |
| `/settings/security` | Security | Change password, then OTP; change mobile, then OTP; set up email code, then OTP |
| `/settings/login-history` | Login & history | Sign out one device, sign out all other devices, download CSV |
| `/settings/api-keys` | API keys | Generate key (live keys need OTP), key generated, view key, regenerate, then OTP, then generated; revoke; add and remove IP |
| `/settings/webhooks` | Webhooks | Add or edit endpoint, view endpoint, delivery detail and resend, roll secret, reveal secret (OTP), retry a paused endpoint, download log |
| `/settings/domains` | Domains & URLs | Add domain (TXT record), check DNS, remove domain, return URLs with https validation |
| `/settings/alerts` | Alerts & recipients | Add or edit recipient, resend consent, fix bounced email, channel matrix, summaries |

The "Service scope" pill (Payment Gateway or Payouts) and the Test mode switch are shared across the settlement, payments and developer screens.

## Connecting a real backend

Each file in `src/services/` is the only place that touches data. Replace the `delay()` and `store.set` bodies with `fetch` calls, and keep the function signatures the same. The views do not need to change.
