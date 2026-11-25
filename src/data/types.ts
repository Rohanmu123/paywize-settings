export type VerificationStatus = "verified" | "pending" | "failed";

export type BusinessProfile = {
  merchantId: string;
  bid: string;
  legalName: string;
  displayName: string;
  businessType: string;
  descriptor: string;
  status: "active" | "suspended" | "closed";
  pan: string;
  gstin: string;
  cin: string;
  category: string;
  registeredAddress: string;
  operatingAddress: string;
  contact: {
    loginEmail: string;
    mobile: string;
    supportEmail: string;
    supportPhone: string;
    website: string;
  };
  owner: { name: string; email: string };
  pendingSettlement: number;
};
