"use client";

import { Copy, MapPin, User } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Divider } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import type { BusinessProfile } from "@/data/types";

/** "Profile row" inside the page header (avatar, legal name, status, BID, address). */
export function ProfileSummary({ profile: p, onCopy }: { profile: BusinessProfile; onCopy?: () => void }) {
  return (
        <div className="flex w-full flex-col items-start gap-3.5 overflow-clip rounded-3xl border border-border bg-surface p-4">
          <div className="flex w-full flex-col items-start gap-6">
            <div className="flex w-full items-center gap-4">
              <Avatar name={p.displayName} size={64} tone="primary-container" />
              <div className="flex flex-col items-start gap-3">
                <div className="flex items-center gap-2.5">
                  <p className="type-20sb text-text-primary whitespace-nowrap">{p.legalName}</p>
                  <Chip tone="success">{p.status === "active" ? "Active" : p.status}</Chip>
                </div>
                <div className="flex items-center gap-1.5">
                  <Icon icon={User} size={16} strokeWidth={1.25} className="text-text-secondary" />
                  <p className="type-12m text-text-secondary">Owner</p>
                  <span aria-hidden className="size-0.5 rounded-full bg-text-secondary" />
                  <p className="type-12m text-text-secondary">BID: {p.bid}</p>
                  <button type="button" aria-label="Copy BID" onClick={onCopy} className="text-text-tertiary">
                    <Icon icon={Copy} size={16} strokeWidth={1.25} />
                  </button>
                </div>
              </div>
            </div>
          </div>
          <Divider />
          <div className="flex items-center gap-2">
            <Icon icon={MapPin} size={16} className="text-text-primary" />
            <p className="type-12r text-text-secondary">{p.operatingAddress}</p>
          </div>
        </div>
  );
}
