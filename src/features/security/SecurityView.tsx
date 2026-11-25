"use client";

import { Fragment, useEffect, useState } from "react";
import { Lock, Mail, Smartphone, type LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { Modal, ModalActions } from "@/components/ui/Modal";
import { OtpModal } from "@/components/ui/OtpModal";
import { Switch } from "@/components/ui/Switch";
import { TextField } from "@/components/ui/TextField";
import { TextLink } from "@/components/ui/TextLink";
import { useToast } from "@/components/ui/Toast";
import { maskMobileDots } from "@/lib/format";
import { useStore } from "@/lib/store";
import { useModal } from "@/lib/useModal";
import { changeMobile, changePassword, enableEmailCode, normaliseMobile, securityStore, setRequireForEveryone, setSensitiveAction, validatePasswordChange, type PasswordForm } from "@/services/security";
import { isEmail, isMobile } from "@/lib/validation";

type SecurityModal = "change-password" | "verify-password" | "change-mobile" | "verify-mobile" | "email-code" | "verify-email";

function Method({ icon, title, chip, detail, action }: { icon: LucideIcon; title: string; chip: React.ReactNode; detail: string; action: React.ReactNode }) {
  return (
    <div className="flex w-full items-center gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-primary-container">
        <Icon icon={icon} size={18} className="text-text-primary" />
      </div>
      <div className="flex min-w-px flex-1 flex-col items-start gap-0.5">
        <div className="flex items-center gap-2">
          <p className="type-14sb whitespace-nowrap text-text-primary">{title}</p>
          {chip}
        </div>
        <p className="type-12r whitespace-nowrap text-text-secondary">{detail}</p>
      </div>
      {action}
    </div>
  );
}

export function SecurityView() {
  const s = useStore(securityStore);
  const toast = useToast();
  const modal = useModal<SecurityModal>();
  const [pw, setPw] = useState<PasswordForm>({ current: "", next: "", confirm: "" });
  const [pwErrors, setPwErrors] = useState<Partial<Record<keyof PasswordForm, string>>>({});
  const [newMobile, setNewMobile] = useState("+91 ");
  const [mobileError, setMobileError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);

  const current = modal.current;
  useEffect(() => {
    if (current === "change-password") {
      setPw({ current: "", next: "", confirm: "" });
      setPwErrors({});
    }
    if (current === "change-mobile") {
      setNewMobile("+91 ");
      setMobileError(null);
    }
    if (current === "email-code") {
      setEmail("");
      setEmailError(null);
    }
  }, [current]);

  const bindPw = (k: keyof PasswordForm) => ({
    type: "password" as const,
    value: pw[k],
    error: pwErrors[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      setPw((p) => ({ ...p, [k]: e.target.value }));
      setPwErrors((x) => ({ ...x, [k]: undefined }));
    },
  });

  const masked = maskMobileDots(s.mobile);

  return (
    <>
      <PageHeader title="Security" scope="Applies to every service" />

      <Card aria-label="Password">
        <CardHeader icon={Lock} title="Password" subtitle={undefined} action={<TextLink onClick={() => modal.open("change-password")}>Change password</TextLink>} />
      </Card>

      <Card aria-label="Two-factor authentication">
        <CardHeader
          icon={Lock}
          title="Two-factor authentication"
          action={
            <label className="flex items-center gap-3">
              <Switch aria-label="Require for everyone" checked={s.requireForEveryone} onChange={async (v) => { await setRequireForEveryone(v); toast.show("changes-saved"); }} />
              <span className="type-14r whitespace-nowrap text-text-primary">Require for everyone</span>
            </label>
          }
        />
        <div className="h-px w-full bg-border-variant" />
        <div className="flex w-full flex-col gap-3">
          <Method icon={Smartphone} title="SMS code" chip={<Chip tone={s.smsEnabled ? "success" : "neutral"}>{s.smsEnabled ? "Enabled" : "Off"}</Chip>} detail={`To ${masked}`} action={<TextLink onClick={() => modal.open("change-mobile")}>Change number</TextLink>} />
          <Method
            icon={Mail}
            title="Email code"
            chip={<Chip tone={s.emailCodeEnabled ? "success" : "neutral"}>{s.emailCodeEnabled ? "Enabled" : "Not set up"}</Chip>}
            detail={`To ${s.email}`}
            action={<TextLink onClick={() => modal.open("email-code")}>{s.emailCodeEnabled ? "Change" : "Set up"}</TextLink>}
          />
        </div>
      </Card>

      <Card aria-label="Ask for a code before sensitive actions">
        <CardHeader icon={Lock} title="Ask for a code before sensitive actions" />
        <div className="flex w-full flex-col gap-3">
          {s.actions.map((a, i) => (
            <Fragment key={a.id}>
              {i > 0 && <div className="h-px w-full bg-border-variant" />}
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-2">
                  <p className="type-14m whitespace-nowrap text-text-primary">{a.label}</p>
                  {a.alwaysOn && <Chip tone="neutral">Always on</Chip>}
                </div>
                <Switch aria-label={a.label} checked={a.on} locked={a.alwaysOn} onChange={async (v) => { await setSensitiveAction(a.id, v); toast.show("changes-saved"); }} />
              </div>
            </Fragment>
          ))}
        </div>
      </Card>

      <Modal open={modal.is("change-password")} onClose={modal.close} width={364} title="Change password" description="You will be signed out of other devices." testId="change-password-modal">
        <TextField label="Current password" placeholder="Enter current password" autoComplete="current-password" containerClassName="w-full" {...bindPw("current")} />
        <TextField label="New password" placeholder="At least 12 characters" autoComplete="new-password" containerClassName="w-full" {...bindPw("next")} />
        <TextField label="Confirm new password" placeholder="Re-enter new password" autoComplete="new-password" containerClassName="w-full" {...bindPw("confirm")} />
        <p className="type-12r text-text-secondary">12 or more characters, a number and a symbol. We will text a code to {masked} to confirm.</p>
        <ModalActions>
          <Button variant="outline" block onClick={modal.close}>Cancel</Button>
          <Button
            block
            onClick={() => {
              const e = validatePasswordChange(pw);
              setPwErrors(e);
              if (!Object.keys(e).length) modal.open("verify-password");
            }}
          >
            Update password
          </Button>
        </ModalActions>
      </Modal>
      <OtpModal open={modal.is("verify-password")} onClose={modal.close} width={364} destination={masked} onVerified={async () => { await changePassword(); modal.close(); toast.show("changes-saved"); }} />

      <Modal open={modal.is("change-mobile")} onClose={modal.close} width={364} title="Change mobile number" description="We will text a code to the new number." testId="change-mobile-modal">
        <TextField label="New mobile number" type="tel" inputMode="tel" placeholder="+91 " containerClassName="w-full" value={newMobile} onChange={(e) => { setNewMobile(e.target.value); setMobileError(null); }} error={mobileError} />
        <ModalActions>
          <Button variant="outline" block onClick={modal.close}>Cancel</Button>
          <Button
            block
            onClick={() => {
              if (!isMobile(newMobile)) return setMobileError("Enter a valid 10-digit mobile number");
              if (normaliseMobile(newMobile) === s.mobile) return setMobileError("This is already your number");
              modal.open("verify-mobile");
            }}
          >
            Verify
          </Button>
        </ModalActions>
      </Modal>
      <OtpModal open={modal.is("verify-mobile")} onClose={modal.close} width={364} destination={isMobile(newMobile) ? maskMobileDots(normaliseMobile(newMobile)) : masked} onVerified={async () => { await changeMobile(newMobile); modal.close(); toast.show("changes-saved"); }} />

      <Modal open={modal.is("email-code")} onClose={modal.close} width={478} title="Set up email code" description="Get a sign-in code by email instead of SMS." testId="email-code-modal">
        <TextField label="Email" type="email" placeholder={s.email} containerClassName="w-full" value={email} onChange={(e) => { setEmail(e.target.value); setEmailError(null); }} error={emailError} />
        <ModalActions>
          <Button variant="outline" block onClick={modal.close}>Cancel</Button>
          <Button
            block
            onClick={() => {
              const target = email.trim() || s.email;
              if (!isEmail(target)) return setEmailError("Enter a valid email");
              setEmail(target);
              modal.open("verify-email");
            }}
          >
            Turn on
          </Button>
        </ModalActions>
      </Modal>
      <OtpModal open={modal.is("verify-email")} onClose={modal.close} width={478} destination={masked} onVerified={async () => { await enableEmailCode(email || s.email); modal.close(); toast.show("changes-saved"); }} />
    </>
  );
}
