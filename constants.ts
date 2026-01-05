
import { SalesRep, Transaction, VoucherType } from './types';

export const INITIAL_REPS: SalesRep[] = [
  { id: 'rep1', name: 'أحمد محمد', currentBalance: 12500, totalReceipts: 15000, totalPayments: 2500 },
  { id: 'rep2', name: 'سارة خالد', currentBalance: 8400, totalReceipts: 10000, totalPayments: 1600 },
  { id: 'rep3', name: 'محمود علي', currentBalance: -500, totalReceipts: 2000, totalPayments: 2500 },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 't1',
    type: VoucherType.RECEIPT,
    amount: 5000,
    date: new Date().toISOString(),
    representativeId: 'rep1',
    representativeName: 'أحمد محمد',
    customerName: 'شركة الأمل للتجارة',
    description: 'دفعة تحت الحساب بضائع شهر 5',
    status: 'approved'
  },
  {
    id: 't2',
    type: VoucherType.PAYMENT,
    amount: 200,
    date: new Date().toISOString(),
    representativeId: 'rep2',
    representativeName: 'سارة خالد',
    customerName: 'محطة وقود السلام',
    description: 'بنزين السيارة - رحلة الشمال',
    status: 'pending'
  }
];
