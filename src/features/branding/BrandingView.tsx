"use client";

import { useRef, useState } from "react";
import { ChevronDown, Pencil } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Divider } from "@/components/ui/Card";
import { FileDrop } from "@/components/ui/FileDrop";
import { Icon } from "@/components/ui/Icon";
import { Modal, ModalActions } from "@/components/ui/Modal";
import { Radio } from "@/components/ui/Radio";
import { TextField } from "@/components/ui/TextField";
import { useToast } from "@/components/ui/Toast";
import { initials } from "@/components/ui/Avatar";
import { BRAND_NAME_MAX, BRAND_SWATCHES, PAYMENT_METHODS, PREVIEW_ORDER, type Branding, type MethodId } from "@/data/branding";
import { cn } from "@/lib/cn";
import { formatINR } from "@/lib/format";
import { useStore } from "@/lib/store";
import { useModal } from "@/lib/useModal";
import { brandingChanged, brandingStore, moveMethod, saveBranding, validateLogo } from "@/services/branding";

const METHOD = Object.fromEntries(PAYMENT_METHODS.map((m) => [m.id, m])) as Record<MethodId, (typeof PAYMENT_METHODS)[number]>;

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-start gap-1 whitespace-nowrap">
      <h2 className="type-14sb text-text-primary">{title}</h2>
      <p className="type-12r text-text-secondary">{subtitle}</p>
    </div>
  );
}

function ColourPicker({ label, value, onChange }: { label: string; value: string; onChange: (hex: string) => void }) {
  const custom = useRef<HTMLInputElement>(null);
  const isCustom = !BRAND_SWATCHES.includes(value as (typeof BRAND_SWATCHES)[number]);
  return (
    <fieldset className="flex flex-col items-start gap-2">
      <legend className="mb-2 type-12m text-text-primary">{label}</legend>
      <div className="flex items-center gap-2.5" role="radiogroup" aria-label={label}>
        {BRAND_SWATCHES.map((hex) => (
          <button
            key={hex}
            type="button"
            role="radio"
            aria-checked={value === hex}
            aria-label={hex}
            onClick={() => onChange(hex)}
            className={cn("flex size-7 items-center justify-center rounded-full", value === hex && "border-[1.5px] border-primary")}
          >
            <span className="size-5 rounded-full" style={{ backgroundColor: hex }} />
          </button>
        ))}
        <button
          type="button"
          aria-label={`Custom ${label.toLowerCase()}`}
          onClick={() => custom.current?.click()}
          className={cn("relative flex size-7 items-center justify-center overflow-clip rounded-full border", isCustom ? "border-[1.5px] border-primary" : "border-border")}
          style={isCustom ? { backgroundColor: value } : undefined}
        >
          <Icon icon={Pencil} size={14} strokeWidth={1.5} className={isCustom ? "text-on-primary" : "text-text-primary"} />
        </button>
        <input ref={custom} type="color" className="sr-only" tabIndex={-1} aria-hidden value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
    </fieldset>
  );
}

function DragDots() {
  return (
    <span aria-hidden className="grid grid-cols-2 gap-[3px]">
      {Array.from({ length: 6 }, (_, i) => (
        <span key={i} className="size-[3px] rounded-full bg-text-secondary" />
      ))}
    </span>
  );
}

function MethodOrder({ order, enabled, onChange }: { order: MethodId[]; enabled: MethodId[]; onChange: (o: MethodId[]) => void }) {
  const [dragging, setDragging] = useState<MethodId | null>(null);
  const visible = order.filter((id) => enabled.includes(id));
  const moveTo = (id: MethodId, target: MethodId) => onChange(moveMethod(order, order.indexOf(id), order.indexOf(target)));
  return (
    <ol className="flex w-full flex-col gap-2" aria-label="Payment method order">
      {visible.map((id, i) => {
        const m = METHOD[id];
        return (
          <li
            key={id}
            draggable
            onDragStart={() => setDragging(id)}
            onDragOver={(e) => {
              e.preventDefault();
              if (dragging && dragging !== id) moveTo(dragging, id);
            }}
            onDragEnd={() => setDragging(null)}
            className={cn("flex w-full items-center gap-3 overflow-clip rounded-2xl border border-border bg-surface p-3", dragging === id && "opacity-60")}
            data-testid={`order-${id}`}
          >
            <Icon icon={m.icon} size={16} className="text-text-primary" />
            <span className="min-w-px flex-1 type-14m text-text-primary">{m.checkout}</span>
            <button
              type="button"
              className="-my-1 flex h-4 cursor-grab items-center active:cursor-grabbing"
              aria-label={`Reorder ${m.checkout}. Use arrow keys to move`}
              onKeyDown={(e) => {
                if (e.key === "ArrowUp" && i > 0) moveTo(id, visible[i - 1]!);
                else if (e.key === "ArrowDown" && i < visible.length - 1) moveTo(id, visible[i + 1]!);
                else return;
                e.preventDefault();
              }}
            >
              <DragDots />
            </button>
          </li>
        );
      })}
    </ol>
  );
}

function CheckoutPreview({ form }: { form: Branding }) {
  const methods = form.order.filter((id) => form.enabled.includes(id)).slice(0, 3);
  const [picked, setPicked] = useState<MethodId | null>(null);
  const active = picked && methods.includes(picked) ? picked : methods[0];
  const amount = formatINR(PREVIEW_ORDER.amount);
  return (
    <div className="flex w-full flex-col items-start gap-4 overflow-clip rounded-3xl bg-background p-4" data-testid="checkout-preview">
      <div className="flex w-full items-center gap-3 overflow-clip rounded-3xl p-4" style={{ backgroundColor: form.headerColor }}>
        <div className="flex size-10 shrink-0 items-center justify-center overflow-clip rounded-xl bg-surface">
          {form.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.logo} alt="" className="size-full object-cover" />
          ) : (
            <span className="type-14sb text-primary">{initials(form.brandName || "?")}</span>
          )}
        </div>
        <div className="flex min-w-px flex-1 flex-col items-start gap-0.5 whitespace-nowrap text-on-primary">
          <p className="type-12m">{form.brandName || "Your brand"}</p>
          <p className="type-20sb">{amount}</p>
        </div>
        <p className="type-12r whitespace-nowrap text-on-primary">Order #{PREVIEW_ORDER.id}</p>
      </div>
      <p className="type-14sb text-text-primary">Select a payment method</p>
      {methods.length === 0 && <p className="type-12r text-text-secondary">Turn on at least one payment method.</p>}
      {methods.map((id) => {
        const m = METHOD[id];
        const on = id === active;
        return (
          <button
            key={id}
            type="button"
            onClick={() => setPicked(id)}
            className={cn("flex w-full items-center gap-3 overflow-clip rounded-xl border p-3.5 text-left", on ? "border-primary bg-primary-container" : "border-border bg-surface")}
          >
            <Icon icon={m.icon} size={16} className="text-text-primary" />
            <span className="min-w-px flex-1 type-14m text-text-primary">{m.checkout}</span>
            <Icon icon={ChevronDown} size={16} className="text-text-primary" />
          </button>
        );
      })}
      <div className="flex w-full items-center justify-center overflow-clip rounded-3xl py-3" style={{ backgroundColor: form.buttonColor }}>
        <p className="type-14m whitespace-nowrap text-on-primary">Pay {amount}</p>
      </div>
      <p className="type-12r text-text-secondary">Secured by Paywize</p>
    </div>
  );
}

export function BrandingView() {
  const saved = useStore(brandingStore);
  const toast = useToast();
  const modal = useModal<"discard">();
  const [form, setForm] = useState<Branding>(saved);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const dirty = brandingChanged(form, saved);
  const set = <K extends keyof Branding>(k: K, v: Branding[K]) => setForm((f) => ({ ...f, [k]: v }));

  const toggleMethod = (id: MethodId, on: boolean) => set("enabled", on ? [...form.enabled, id] : form.enabled.filter((m) => m !== id));

  const onLogo = (file: File | null, error: string | null) => {
    setLogoFile(file);
    setLogoError(error);
    if (!file || error) return;
    const reader = new FileReader();
    reader.onload = () => set("logo", String(reader.result));
    reader.readAsDataURL(file);
  };

  const discard = () => {
    setForm(saved);
    setLogoFile(null);
    setLogoError(null);
    setNameError(null);
    modal.close();
  };

  const save = async () => {
    if (!form.brandName.trim()) return setNameError("Enter a brand name");
    if (form.enabled.length === 0) return;
    setSaving(true);
    await saveBranding({ ...form, brandName: form.brandName.trim() });
    setSaving(false);
    toast.show("changes-saved");
  };

  return (
    <>
      <PageHeader title="Branding" scope="Applies to every service" />

      <div className="flex w-full items-start gap-3">
        <section aria-label="Branding form" className="flex min-w-px flex-1 flex-col items-start gap-6 self-stretch rounded-3xl bg-surface p-5">
          <div className="flex w-full flex-col items-start gap-4">
            <SectionTitle title="Appearance" subtitle="Shown to your customers on checkout and receipts." />
            <FileDrop
              surface="background"
              title={logoFile && !logoError ? logoFile.name : "Upload logo"}
              hint="Square, at least 256 × 256 px. PNG, JPG or SVG, up to 1 MB."
              accept=".png,.jpg,.jpeg,.svg"
              validate={validateLogo}
              onFile={onLogo}
              error={logoError}
            />
            <TextField
              label="Display brand name"
              containerClassName="w-full"
              value={form.brandName}
              maxLength={BRAND_NAME_MAX}
              onChange={(e) => {
                set("brandName", e.target.value);
                setNameError(null);
              }}
              error={nameError}
              helper={`Up to ${BRAND_NAME_MAX} characters`}
            />
            <ColourPicker label="Header colour" value={form.headerColor} onChange={(v) => set("headerColor", v)} />
            <ColourPicker label="Primary button colour" value={form.buttonColor} onChange={(v) => set("buttonColor", v)} />
          </div>

          <Divider faint />

          <div className="flex w-full flex-col items-start gap-3">
            <SectionTitle title="Payment methods" subtitle="Choose what customers can pay with." />
            <p className="type-12m text-text-primary">Available payment methods</p>
            <div className="grid w-full grid-cols-3 gap-3 overflow-clip rounded-3xl bg-background p-4" role="group" aria-label="Available payment methods">
              {PAYMENT_METHODS.map((m) => (
                <Checkbox key={m.id} label={m.label} checked={form.enabled.includes(m.id)} onChange={(on) => toggleMethod(m.id, on)} />
              ))}
            </div>
            {form.enabled.length === 0 && <p className="type-12r text-error">Keep at least one payment method on.</p>}
            <p className="type-12m text-text-primary">Payment method order</p>
            <MethodOrder order={form.order} enabled={form.enabled} onChange={(o) => set("order", o)} />
          </div>

          <Divider faint />

          <div className="flex w-full flex-col items-start gap-3">
            <SectionTitle title="If a payment fails" subtitle="Choose what customers can do next." />
            <div className="flex w-full flex-col items-start gap-3 overflow-clip rounded-3xl bg-background p-4" role="radiogroup" aria-label="If a payment fails">
              <Radio name="on-failure" value="return" checked={form.onFailure === "return"} onChange={() => set("onFailure", "return")} label="Return to merchant page" />
              <Radio name="on-failure" value="retry" checked={form.onFailure === "retry"} onChange={() => set("onFailure", "retry")} label="Retry payment" />
            </div>
          </div>
        </section>

        <section aria-label="Checkout preview" className="flex min-w-px flex-1 flex-col items-start gap-6 self-stretch rounded-3xl bg-surface p-5">
          <SectionTitle title="Preview" subtitle="Updates as you change the form." />
          <CheckoutPreview form={form} />
        </section>
      </div>

      <div className="flex w-full items-center justify-end gap-3 overflow-clip rounded-3xl border border-border-variant bg-surface px-5 py-4" data-testid="save-bar">
        <p className="type-14m whitespace-nowrap text-text-secondary" aria-live="polite">
          {dirty ? "Unsaved changes" : "No unsaved changes"}
        </p>
        <button type="button" className="type-12sb text-primary hover:underline disabled:text-text-disabled disabled:no-underline" onClick={() => modal.open("discard")}>
          Discard
        </button>
        <Button onClick={save} disabled={saving || form.enabled.length === 0}>
          Save changes
        </Button>
      </div>

      <Modal open={modal.is("discard")} onClose={modal.close} width={364} title="Discard changes?" description="Your logo and colour edits will be lost." testId="discard-changes-modal">
        <ModalActions>
          <Button variant="outline" block onClick={modal.close}>Keep editing</Button>
          <Button variant="danger" block onClick={discard}>Discard</Button>
        </ModalActions>
      </Modal>
    </>
  );
}
