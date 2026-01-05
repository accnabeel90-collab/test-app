
export enum VoucherType {
  RECEIPT = 'RECEIPT', // قبض
  PAYMENT = 'PAYMENT'  // صرف
}

export enum UserRole {
  SALES_REP = 'SALES_REP',
  FINANCIAL_MANAGER = 'FINANCIAL_MANAGER'
}

export interface Transaction {
  id: string;
  type: VoucherType;
  amount: number;
  date: string;
  representativeId: string;
  representativeName: string;
  customerName: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface SalesRep {
  id: string;
  name: string;
  currentBalance: number;
  totalReceipts: number;
  totalPayments: number;
}

export interface AppState {
  transactions: Transaction[];
  reps: SalesRep[];
  currentUser: {
    id: string;
    name: string;
    role: UserRole;
  } | null;
}
