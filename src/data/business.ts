import type { BusinessProfile } from "./types";

export const BUSINESS_CATEGORIES = [
  "Apparel & accessories retail (MCC 5651)",
  "Textile wholesale (MCC 5131)",
  "Department stores (MCC 5311)",
  "Home furnishing (MCC 5719)",
];

export const businessProfile: BusinessProfile = {
  merchantId: "PWM10619",
  bid: "YB-8821-X92",
  legalName: "Sharma Textiles Private Limited",
  displayName: "Sharma Textiles",
  businessType: "Private limited company",
  descriptor: "Textile wholesale · Private Ltd",
  status: "active",
  pan: "ABCPS••••F",
  gstin: "27ABCPS1234F1Z5",
  cin: "U17110MH2019PTC321456",
  category: BUSINESS_CATEGORIES[0]!,
  registeredAddress: "Unit 4, Bhiwandi Industrial Estate, Thane, Maharashtra 421302",
  operatingAddress: "Plot 14, Ring Road, Surat, Gujarat 395002",
  contact: {
    loginEmail: "accounts@sharmatextiles.in",
    mobile: "9876543765",
    supportEmail: "support@sharmatextiles.in",
    supportPhone: "9876543765",
    website: "www.sharmatextiles.in",
  },
  owner: { name: "Rohan Sharma", email: "rohan@sharmatextiles.in" },
  pendingSettlement: 656546.66,
};
