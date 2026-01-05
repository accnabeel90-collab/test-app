
import React, { useState } from 'react';
import { AppState, VoucherType, Transaction } from '../types';
import StatsCard from './StatsCard';
import VoucherForm from './VoucherForm';

interface RepViewProps {
  state: AppState;
  onAddTransaction: (t: Partial<Transaction>) => void;
}

const SalesRepView: React.FC<RepViewProps> = ({ state, onAddTransaction }) => {
  const [showForm, setShowForm] = useState<VoucherType | null>(null);
  
  const currentRep = state.reps.find(r => r.id === state.currentUser?.id);
  const repTransactions = state.transactions.filter(t => t.representativeId === state.currentUser?.id);

  if (!currentRep) return <div>يرجى تسجيل الدخول كمندوب مبيعات</div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">مرحباً، {currentRep.name}</h1>
          <p className="text-slate-500">إدارة صندوق المبيعات الميداني</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl flex flex-col justify-between md:col-span-2">
          <div>
            <p className="text-blue-100 text-sm font-medium mb-2">رصيد الصندوق الحالي</p>
            <h2 className="text-5xl font-bold tracking-tight">{currentRep.currentBalance.toLocaleString()} <span className="text-xl font-normal">ريال</span></h2>
          </div>
          <div className="flex gap-4 mt-8">
            <div className="bg-white/10 rounded-2xl p-4 flex-1">
              <p className="text-xs text-blue-100">إجمالي المقبوضات</p>
              <p className="text-xl font-bold">{currentRep.totalReceipts.toLocaleString()}</p>
            </div>
            <div className="bg-white/10 rounded-2xl p-4 flex-1">
              <p className="text-xs text-blue-100">إجمالي المصروفات</p>
              <p className="text-xl font-bold">{currentRep.totalPayments.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <button 
            onClick={() => setShowForm(VoucherType.RECEIPT)}
            className="flex-1 bg-white border-2 border-emerald-100 rounded-3xl p-6 text-emerald-600 flex flex-col items-center justify-center gap-3 hover:bg-emerald-50 transition-all active:scale-95 group"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            </div>
            <span className="font-bold">سند قبض جديد</span>
          </button>
          
          <button 
            onClick={() => setShowForm(VoucherType.PAYMENT)}
            className="flex-1 bg-white border-2 border-rose-100 rounded-3xl p-6 text-rose-600 flex flex-col items-center justify-center gap-3 hover:bg-rose-50 transition-all active:scale-95 group"
          >
            <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" /></svg>
            </div>
            <span className="font-bold">سند صرف جديد</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800">حركات صندوقي</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {repTransactions.length > 0 ? (
            repTransactions.map((t) => (
              <div key={t.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    t.type === VoucherType.RECEIPT ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                  }`}>
                    {t.type === VoucherType.RECEIPT ? 
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11l5-5m0 0l5 5m-5-5v12" /></svg> : 
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 13l-5 5m0 0l-5-5m5 5V6" /></svg>
                    }
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{t.customerName}</h4>
                    <p className="text-sm text-slate-500">{t.description}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{new Date(t.date).toLocaleString('ar-SA')}</p>
                  </div>
                </div>
                <div className="text-left">
                  <p className={`font-bold text-lg ${t.type === VoucherType.RECEIPT ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {t.type === VoucherType.RECEIPT ? '+' : '-'}{t.amount.toLocaleString()} ريال
                  </p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    t.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 
                    t.status === 'rejected' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {t.status === 'approved' ? 'معتمد' : t.status === 'rejected' ? 'مرفوض' : 'معلق'}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-slate-400">لا توجد عمليات مسجلة بعد</div>
          )}
        </div>
      </div>

      {showForm && (
        <VoucherForm 
          type={showForm} 
          onSubmit={(data) => {
            onAddTransaction(data);
            setShowForm(null);
          }} 
          onCancel={() => setShowForm(null)}
        />
      )}
    </div>
  );
};

export default SalesRepView;
