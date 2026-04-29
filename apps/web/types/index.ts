export interface User {
  id: number;
  fullName: string;
  email?: string;
  phone?: string;
  role: "recycler" | "operator" | "company_admin" | "platform_admin";
  isActive: boolean;
}

export interface Company {
  id: number;
  name: string;
  verified: boolean;
}

export interface Site {
  id: number;
  companyId: number;
  name: string;
  acceptedMaterials: string[];
  isOpen: boolean;
}

export interface Dropoff {
  id: number;
  recyclerId: number;
  siteId: number;
  materialType: string;
  itemCount: number;
  estimatedWeightKg: number;
  estimatedCo2AvoidedKg: number;
  status: "pending" | "confirmed" | "flagged";
  confirmedAt?: string;
}

export interface Wallet {
  userId: number;
  tokenBalance: number;
  pendingKesAmount: number;
  totalSatsPaid: number;
}

export interface RewardTransaction {
  id: number;
  walletId: number;
  type: "tokens" | "kes" | "sats";
  amount: number;
  status: "pending" | "completed" | "failed";
  createdAt: string;
}
