import Image from "next/image";
import Link from "next/link";
import { ChartColumn, Download, FileText, House, Landmark, Send, Settings, Sparkles, TriangleAlert, type LucideIcon } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/cn";
import { ROUTES } from "@/lib/routes";

const APP_NAV: { label: string; icon: LucideIcon; accent?: boolean }[] = [
  { label: "Home", icon: House },
  { label: "Collections", icon: Download },
  { label: "Payouts", icon: Send },
  { label: "Banking", icon: Landmark },
  { label: "Reports", icon: ChartColumn },
  { label: "Invoices", icon: FileText },
  { label: "Disputes", icon: TriangleAlert },
  { label: "Paywize AI", icon: Sparkles, accent: true },
];

function Wrap({ children, active, label }: { children: React.ReactNode; active?: boolean; label: string }) {
  return (
    <span title={label} className={cn("flex size-10 items-center justify-center overflow-clip rounded-3xl hover:bg-background", active && "bg-primary-container hover:bg-primary-container")}>
      {children}
    </span>
  );
}

/** Product rail (64px, 24 radius) — same on every settings screen. */
export function Sidebar() {
  return (
    <nav
      aria-label="Product"
      className="fixed top-3 left-3 z-10 flex h-[calc(100vh-55px)] min-h-[520px] w-16 flex-col items-center justify-between overflow-clip rounded-3xl border border-border-variant bg-surface p-3"
    >
      <div className="flex flex-col items-start gap-4">
        <Link href={ROUTES.businessProfile} aria-label="Paywize home">
          <Image src="/brand/logo.svg" alt="Paywize" width={40} height={40} priority />
        </Link>
        <ul className="flex flex-col items-start gap-2">
          {APP_NAV.map((item) => (
            <li key={item.label}>
              <button type="button" aria-label={item.label}>
                <Wrap label={item.label}>
                  <Icon icon={item.icon} size={20} className={item.accent ? "text-primary" : "text-text-secondary"} />
                </Wrap>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-col items-start gap-2">
        <Link href={ROUTES.businessProfile} aria-label="Settings" aria-current="page">
          <Wrap label="Settings" active>
            <Icon icon={Settings} size={20} className="text-text-secondary" />
          </Wrap>
        </Link>
        <Avatar name="Rohan Sharma" tone="warning" />
      </div>
    </nav>
  );
}
