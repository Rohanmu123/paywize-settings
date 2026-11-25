"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { SETTINGS_NAV, activeNavHref } from "@/lib/routes";

export function SettingsNav() {
  const pathname = usePathname() ?? "";
  const active = activeNavHref(pathname);
  return (
    <nav aria-label="Settings" className="flex w-[248px] shrink-0 flex-col items-start gap-1 overflow-clip rounded-3xl bg-surface p-4">
      {SETTINGS_NAV.map((group, gi) => (
        <Fragment key={group.label}>
          <p className={cn("w-full pl-3 type-12m text-text-secondary whitespace-nowrap", gi > 0 && "pt-3")}>{group.label}</p>
          <ul className="flex w-full flex-col items-start gap-0.5">
            {group.items.map((item) => {
              const isActive = item.href === active;
              return (
                <li key={item.href} className="w-full">
                  <Link
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex w-full items-center gap-2.5 overflow-clip rounded-xl px-3 py-2.5 type-14m text-text-primary whitespace-nowrap",
                      isActive ? "bg-background" : "hover:bg-surface-variant",
                    )}
                  >
                    <Icon icon={item.icon} size={16} className="text-text-primary" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </Fragment>
      ))}
    </nav>
  );
}
