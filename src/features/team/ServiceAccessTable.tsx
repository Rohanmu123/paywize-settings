"use client";

import { Chip } from "@/components/ui/Chip";
import { DataTable } from "@/components/ui/DataTable";
import { Switch } from "@/components/ui/Switch";
import { SERVICE_MODE, SERVICES, type ServiceId, type ServiceMode } from "@/data/team";

/** "Service (and mode) access" table: SERVICE · ACCESS switch (260) · MODE chip (240). */
export function ServiceAccessTable({ value, onChange }: { value: Record<ServiceId, ServiceMode>; onChange: (next: Record<ServiceId, ServiceMode>) => void }) {
  return (
    <DataTable
      caption="Service access"
      rows={SERVICES}
      rowKey={(s) => s.id}
      // Figma keeps the hairline under the last row in this table.
      className="[&_tbody_tr:last-child_td]:border-b-[0.5px] [&_tbody_tr:last-child_td]:border-border"
      columns={[
        { key: "service", header: "Service", render: (s) => s.label },
        {
          key: "access",
          header: "Access",
          width: 260,
          render: (s) => (
            <span className="flex">
              <Switch aria-label={`${s.label} access`} checked={value[s.id] !== "none"} onChange={(on) => onChange({ ...value, [s.id]: on ? "live-test" : "none" })} />
            </span>
          ),
        },
        {
          key: "mode",
          header: "Mode",
          width: 240,
          render: (s) => {
            const mode = value[s.id];
            const chip = <Chip tone={SERVICE_MODE[mode].tone}>{SERVICE_MODE[mode].label}</Chip>;
            if (mode === "none") return chip;
            // Click the chip to toggle between live+test and test-only.
            return (
              <button type="button" aria-label={`${s.label} mode: ${SERVICE_MODE[mode].label}. Click to change`} onClick={() => onChange({ ...value, [s.id]: mode === "live-test" ? "test" : "live-test" })}>
                {chip}
              </button>
            );
          },
        },
      ]}
    />
  );
}
