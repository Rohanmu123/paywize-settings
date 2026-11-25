"use client";

import { Building2, IdCard, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, Divider, Panel } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Field, FieldRow } from "@/components/ui/Field";
import { TextLink } from "@/components/ui/TextLink";
import { useToast } from "@/components/ui/Toast";
import { formatINR, maskMobile } from "@/lib/format";
import { useStore } from "@/lib/store";
import { useModal } from "@/lib/useModal";
import { businessStore } from "@/services/business";
import { ProfileSummary } from "./ProfileSummary";
import { BusinessProfileModals, type BusinessProfileModal } from "./BusinessProfileModals";

export function BusinessProfileView() {
  const p = useStore(businessStore);
  const modal = useModal<BusinessProfileModal>();
  const toast = useToast();

  const copyBid = async () => {
    try {
      await navigator.clipboard?.writeText(p.bid);
    } catch {
      /* clipboard blocked — ignore */
    }
    toast.show("changes-saved");
  };

  return (
    <>
      <PageHeader title="Business profile" scope="Applies to every service">
        <ProfileSummary profile={p} onCopy={copyBid} />
      </PageHeader>

      <Card aria-label="Business details">
        <CardHeader icon={Building2} title="Business details" action={<TextLink onClick={() => modal.open("edit-business")}>Edit business details</TextLink>} />
        <Panel>
          <FieldRow>
            <Field label="Legal name" locked>{p.legalName}</Field>
            <Field label="Business type" locked>{p.businessType}</Field>
            <Field label="Display name (shown to customers)">{p.displayName}</Field>
          </FieldRow>
          <Divider faint />
          <FieldRow>
            <Field label="PAN" locked trailing={<Chip tone="success">Verified</Chip>}>{p.pan}</Field>
            <Field label="GSTIN" trailing={<Chip tone="success">Verified</Chip>}>{p.gstin}</Field>
            <Field label="CIN" locked>{p.cin}</Field>
          </FieldRow>
          <Divider faint />
          <FieldRow>
            <Field label="Business category" className="w-[361.333px] flex-none">{p.category}</Field>
            <Field label="Registered address" locked>{p.registeredAddress}</Field>
          </FieldRow>
        </Panel>
      </Card>

      <Card aria-label="Contact & support">
        <CardHeader icon={IdCard} title="Contact & support" action={<TextLink onClick={() => modal.open("edit-contact")}>Edit contact</TextLink>} />
        <Panel>
          <FieldRow>
            <Field label="Login email" trailing={<Chip tone="success">Verified</Chip>}>{p.contact.loginEmail}</Field>
            <Field label="Mobile number" trailing={<Chip tone="success">Verified</Chip>}>{maskMobile(p.contact.mobile)}</Field>
            <Field label="Customer support email">{p.contact.supportEmail}</Field>
          </FieldRow>
          <Divider faint />
          <FieldRow>
            <Field label="Customer support phone">{maskMobile(p.contact.supportPhone)}</Field>
            <Field label="Website">{p.contact.website}</Field>
            <Field label="Shown on" muted>Checkout, receipts, refund emails</Field>
          </FieldRow>
        </Panel>
      </Card>

      <Card aria-label="Account owner">
        <CardHeader icon={Users} title="Account owner" />
        <Panel row>
          <Avatar name={p.owner.name} />
          <div className="flex min-w-px flex-1 flex-col items-start gap-0.5">
            <div className="flex items-center gap-2">
              <p className="type-14sb text-text-primary">{p.owner.name}</p>
              <Chip tone="brand">Owner</Chip>
            </div>
            <p className="type-12r text-text-secondary whitespace-pre">{`${p.owner.email}  ·  Full access to all services`}</p>
          </div>
          <TextLink onClick={() => modal.open("transfer-ownership")}>Transfer ownership</TextLink>
        </Panel>
      </Card>

      <section aria-label="Danger zone" className="flex w-full items-center gap-4 overflow-clip rounded-3xl bg-error-container p-5">
        <div className="flex min-w-px flex-1 flex-col items-start gap-0.5 text-on-error-container">
          <p className="type-14sb">Close account</p>
          <p className="type-12r">
            Stops all services. Pending settlements of {formatINR(p.pendingSettlement)} are paid out first and the account is archived for 8 years as per RBI norms.
          </p>
        </div>
        <Button variant="danger" onClick={() => modal.open("close-account")}>
          Close account
        </Button>
      </section>

      <BusinessProfileModals modal={modal} profile={p} />
    </>
  );
}
