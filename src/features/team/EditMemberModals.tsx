"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Modal, ModalActions } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import type { Member } from "@/data/team";
import { ROUTES } from "@/lib/routes";
import { removeMember, resetTwoFactor, suspendMember } from "@/services/team";

type Props = { open: boolean; onClose: () => void; member: Member };
const firstName = (m: Member) => m.name.split(" ")[0];

export function ResetTwoFactorModal({ open, onClose, member }: Props) {
  const toast = useToast();
  return (
    <Modal open={open} onClose={onClose} width={364} title="Reset two-factor?" description={`${firstName(member)} must set it up again at next sign-in.`} testId="reset-2fa-modal">
      <ModalActions>
        <Button variant="outline" block onClick={onClose}>Cancel</Button>
        <Button variant="danger" block onClick={async () => { await resetTwoFactor(member.id); onClose(); toast.show("changes-saved"); }}>Reset</Button>
      </ModalActions>
    </Modal>
  );
}

export function SuspendMemberModal({ open, onClose, member }: Props) {
  const toast = useToast();
  return (
    <Modal open={open} onClose={onClose} width={478} title="Suspend member" description="Access is blocked until you restore it." testId="suspend-member-modal">
      <Alert tone="warning" title={`${member.name} loses access now`}>
        Their API keys and sessions are revoked.
      </Alert>
      <ModalActions>
        <Button variant="outline" block onClick={onClose}>Cancel</Button>
        <Button variant="danger" block onClick={async () => { await suspendMember(member.id); onClose(); toast.show("changes-saved"); }}>Suspend</Button>
      </ModalActions>
    </Modal>
  );
}

export function RemoveMemberModal({ open, onClose, member }: Props) {
  const toast = useToast();
  const router = useRouter();
  const [ack, setAck] = useState(false);
  useEffect(() => {
    if (open) setAck(false);
  }, [open]);
  return (
    <Modal open={open} onClose={onClose} width={478} title="Remove from team?" description="This cannot be undone." testId="remove-member-modal">
      <Alert tone="error" title={`${member.name} will be removed`}>
        You can invite them again later.
      </Alert>
      <Checkbox checked={ack} onChange={setAck} label="I understand this removes all access" />
      <ModalActions>
        <Button variant="outline" block onClick={onClose}>Cancel</Button>
        <Button
          variant="danger"
          block
          disabled={!ack}
          onClick={async () => {
            await removeMember(member.id);
            toast.show("changes-saved");
            router.push(ROUTES.team);
          }}
        >
          Remove
        </Button>
      </ModalActions>
    </Modal>
  );
}
