export type SensitiveAction = { id: string; label: string; alwaysOn: boolean; on: boolean };

export type SecurityState = {
  mobile: string;
  smsEnabled: boolean;
  email: string;
  emailCodeEnabled: boolean;
  requireForEveryone: boolean;
  passwordChanged: string;
  actions: SensitiveAction[];
};

export const initialSecurity: SecurityState = {
  mobile: "9845612214",
  smsEnabled: true,
  email: "accounts@sharmatextiles.in",
  emailCodeEnabled: false,
  requireForEveryone: true,
  passwordChanged: "42 days ago",
  actions: [
    { id: "api-keys", label: "Reveal or regenerate API keys", alwaysOn: true, on: true },
    { id: "bank", label: "Add or change a settlement bank account", alwaysOn: true, on: true },
    { id: "team", label: "Change team roles or transfer ownership", alwaysOn: true, on: true },
    { id: "kyc-download", label: "Download KYC documents", alwaysOn: false, on: true },
  ],
};
