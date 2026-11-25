import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";
import { SettingsNav } from "./SettingsNav";

/**
 * Frame scaffold shared by all "Settings v2.2-B" screens:
 * rail at x=12, main column at x=86 (1182 wide at a 1280 viewport),
 * top nav, then settings nav (248) + content column with 16px gap.
 */
export function SettingsShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen min-w-[1280px] bg-surface-variant">
      <Sidebar />
      <div className="ml-[86px] flex w-[calc(100%-98px)] flex-col items-start gap-3 pt-[13px] pb-[65px]">
        <TopNav />
        <div className="flex w-full items-start gap-4">
          <SettingsNav />
          <main className="flex min-w-px flex-1 flex-col items-start gap-3">{children}</main>
        </div>
      </div>
    </div>
  );
}
