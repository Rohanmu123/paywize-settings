"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { Avatar } from "@/components/ui/Avatar";
import { formatToday } from "@/lib/format";

export function TopNav({ title = "Settings" }: { title?: string }) {
  const [today, setToday] = useState<string>("");
  useEffect(() => setToday(formatToday(new Date())), []);
  return (
    <header className="flex h-14 w-full shrink-0 items-center justify-between overflow-clip rounded-[20px] bg-surface px-3 py-2">
      <div className="flex items-center gap-2 overflow-clip">
        <h1 className="type-16sb text-text-primary whitespace-nowrap">{title}</h1>
        <span aria-hidden className="size-[5px] rounded-full bg-text-secondary" />
        <p className="type-14r text-text-secondary whitespace-nowrap" suppressHydrationWarning>
          {today}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button type="button" aria-label="Notifications" className="flex size-9 items-center justify-center rounded-[18px] border border-border bg-surface hover:bg-background">
          <Icon icon={Bell} size={20} className="text-text-primary" />
        </button>
        <Avatar name="Rohan Sharma" tone="on-primary-container" />
      </div>
    </header>
  );
}
