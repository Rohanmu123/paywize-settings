"use client";

import { useEffect, useState } from "react";
import { Button } from "./Button";
import { Modal, ModalActions, type ModalWidth } from "./Modal";
import { OtpInput, OTP_LENGTH } from "./OtpInput";
import { verifyOtp } from "@/services/otp";

export const OTP_TTL_SECONDS = 120;

/**
 * "Verify OTP · …" pop-up. Shows a 120 sec countdown, "Resend OTP" once it
 * reaches zero (and always clickable, as in the design), and calls onVerified
 * after the mock service accepts the code.
 */
export function OtpModal({
  open,
  onClose,
  onVerified,
  destination,
  width = 565,
  description,
  verifyVariant = "primary",
}: {
  open: boolean;
  onClose: () => void;
  onVerified: () => void;
  destination: string;
  width?: ModalWidth;
  description?: string;
  /** The regenerate-key flow uses a danger Verify button. */
  verifyVariant?: "primary" | "danger";
}) {
  const [code, setCode] = useState("");
  const [seconds, setSeconds] = useState(OTP_TTL_SECONDS);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCode("");
    setError(null);
    setSeconds(OTP_TTL_SECONDS);
  }, [open]);

  useEffect(() => {
    if (!open || seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [open, seconds]);

  const submit = async () => {
    if (code.length < OTP_LENGTH) {
      setError("Enter the 6-digit code");
      return;
    }
    setBusy(true);
    const ok = await verifyOtp(code);
    setBusy(false);
    if (!ok) {
      setError("That code is incorrect. Try again.");
      return;
    }
    onVerified();
  };

  return (
    <Modal open={open} onClose={onClose} width={width} title="Verify OTP" description={description ?? `Enter OTP sent to ${destination}`} testId="otp-modal">
      <div className="flex w-full flex-col items-start gap-1.5">
        <OtpInput value={code} onChange={(v) => { setCode(v); setError(null); }} invalid={!!error} />
        <div className="flex w-full items-center justify-between type-12r whitespace-nowrap">
          {error ? (
            <p role="alert" className="text-error">{error}</p>
          ) : (
            <p className="text-text-secondary" aria-live="polite">
              {seconds > 0 ? `OTP expires in ${seconds} sec` : "OTP expired"}
            </p>
          )}
          <button
            type="button"
            className="text-primary hover:underline"
            onClick={() => {
              setSeconds(OTP_TTL_SECONDS);
              setCode("");
              setError(null);
            }}
          >
            Resend OTP
          </button>
        </div>
      </div>
      <ModalActions>
        <Button block variant={verifyVariant} onClick={submit} disabled={busy}>
          Verify
        </Button>
      </ModalActions>
    </Modal>
  );
}
