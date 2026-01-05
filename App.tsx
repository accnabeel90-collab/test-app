
import React, { useState, useEffect, useCallback } from 'react';
import { AppState, UserRole, Transaction, VoucherType, SalesRep } from './types';
import { INITIAL_REPS } from './constants';
import { supabase } from './lib/supabase';
import FinancialDashboard from './components/FinancialDashboard';
import SalesRepView from './components/SalesRepView';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    transactions: [],
    reps: INITIAL_REPS,
    currentUser: null
  });
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);
  const [isLive, setIsLive] = useState(false);

  // Fetch data and setup realtime subscription
  useEffect(() => {
    const fetchData = async () => {
      // 1. Fetch Transactions
      const { data: transactionsData, error: tError } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });
      
      if (!tError && transactionsData) {
        setState(prev => ({ ...prev, transactions: transactionsData }));
      }

      // 2. Fetch/Sync Reps (In a real app, this would be a table join)
      // For this prototype, we calculate balances from transactions
      recalculateBalances(transactionsData || []);
      setIsLive(true);
    };

    fetchData();

    // Setup Realtime subscription
    const subscription = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transactions' },
        (payload) => {
          console.log('Realtime change received!', payload);
          handleRealtimeUpdate(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const handleRealtimeUpdate = (payload: any) => {
    setState(prev => {
      let newTransactions = [...prev.transactions];
      if (payload.eventType === 'INSERT') {
        newTransactions = [payload.new, ...newTransactions];
      } else if (payload.eventType === 'UPDATE') {
        newTransactions = newTransactions.map(t => t.id === payload.new.id ? payload.new : t);
      } else if (payload.eventType === 'DELETE') {
        newTransactions = newTransactions.filter(t => t.id !== payload.old.id);
      }
      
      // Sync rep balances locally as well for immediate feedback
      recalculateBalances(newTransactions);
      return { ...prev, transactions: newTransactions };
    });
  };

  const recalculateBalances = useCallback((transactions: Transaction[]) => {
    setState(prev => {
      const newReps = prev.reps.map(rep => {
        const repTrans = transactions.filter(t => t.representativeId === rep.id && t.status === 'approved');
        const receipts = repTrans.filter(t => t.type === VoucherType.RECEIPT).reduce((s, t) => s + t.amount, 0);
        const payments = repTrans.filter(t => t.type === VoucherType.PAYMENT).reduce((s, t) => s + t.amount, 0);
        return {
          ...rep,
          totalReceipts: receipts,
          totalPayments: payments,
          currentBalance: receipts - payments
        };
      });
      return { ...prev, reps: newReps };
    });
  }, []);

  useEffect(() => {
    const checkKey = async () => {
      const selected = await (window as any).aistudio.hasSelectedApiKey();
      setHasApiKey(selected);
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    try {
      await (window as any).aistudio.openSelectKey();
      setHasApiKey(true);
    } catch (e) {
      console.error("Failed to open key selector", e);
    }
  };

  const handleLogin = (role: UserRole, id: string, name: string) => {
    setState(prev => ({ ...prev, currentUser: { id, name, role } }));
  };

  const handleAddTransaction = async (newT: Partial<Transaction>) => {
    if (!state.currentUser) return;
    
    const transaction = {
      ...newT,
      representativeId: state.currentUser.id,
      representativeName: state.currentUser.name,
      status: 'pending'
    };

    const { error } = await supabase.from('transactions').insert([transaction]);
    if (error) {
      alert("خطأ في حفظ البيانات: " + error.message);
    }
  };

  const handleAction = async (id: string, action: 'approved' | 'rejected') => {
    const { error } = await supabase
      .from('transactions')
      .update({ status: action })
      .eq('id', id);
    
    if (error) {
      alert("خطأ في تحديث الحالة: " + error.message);
    }
  };

  // 1. API Key Selection UI
  if (hasApiKey === false) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950">
        <div className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-10 text-center shadow-2xl">
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl mx-auto flex items-center justify-center shadow-indigo-500/20 shadow-2xl mb-8">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">تفعيل الذكاء الاصطناعي</h1>
          <p className="text-slate-400 mb-8 leading-relaxed">
            للحصول على تحليلات مالية متقدمة وتقارير ذكية للصناديق، يرجى ربط مفتاح Gemini API الخاص بك.
          </p>
          <button 
            onClick={handleSelectKey}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95 mb-6"
          >
            إعداد مفتاح Gemini API
          </button>
          <a 
            href="https://ai.google.dev/gemini-api/docs/billing" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-slate-500 hover:text-indigo-400 transition-colors"
          >
            تعرف على كيفية إنشاء مفتاح API والفوترة
          </a>
        </div>
      </div>
    );
  }

  // 2. Login UI
  if (!state.currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="space-y-4">
            <div className="w-20 h-20 bg-blue-600 rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-blue-500/30">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-4xl font-black text-white">FinanceHub</h1>
            <p className="text-slate-400">اختر نوع الدخول لمتابعة حسابات الصناديق السحابية</p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <button 
              onClick={() => handleLogin(UserRole.FINANCIAL_MANAGER, 'admin', 'المدير المالي')}
              className="bg-white hover:bg-slate-50 text-slate-900 font-bold py-5 px-8 rounded-3xl transition-all shadow-xl hover:scale-[1.02] active:scale-95 flex items-center justify-between"
            >
              <span>دخول الإدارة المالية</span>
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </button>
            <div className="h-px bg-slate-800 my-4" />
            {INITIAL_REPS.map(rep => (
              <button 
                key={rep.id}
                onClick={() => handleLogin(UserRole.SALES_REP, rep.id, rep.name)}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-5 px-8 rounded-3xl transition-all border border-slate-700 hover:scale-[1.02] active:scale-95 flex items-center justify-between"
              >
                <span>دخول المندوب: {rep.name}</span>
                <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-0">
      <nav className="bg-white border-b border-slate-100 sticky top-0 z-40 backdrop-blur-md bg-white/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold relative">
              F
              {isLive && <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white live-pulse"></span>}
            </div>
            <span className="text-xl font-black text-slate-800 tracking-tight">FinanceHub</span>
            {isLive && <span className="hidden sm:inline text-[10px] bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full font-bold">بث مباشر</span>}
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col text-left">
              <span className="text-sm font-bold text-slate-800">{state.currentUser.name}</span>
              <span className="text-xs text-slate-500">{state.currentUser.role === UserRole.FINANCIAL_MANAGER ? 'مدير مالي' : 'مندوب مبيعات'}</span>
            </div>
            <button 
              onClick={() => setState(prev => ({ ...prev, currentUser: null }))}
              className="p-2 hover:bg-rose-50 text-rose-500 rounded-xl transition-colors"
              title="تسجيل خروج"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {state.currentUser.role === UserRole.FINANCIAL_MANAGER ? (
          <FinancialDashboard 
            state={state} 
            onApprove={(id) => handleAction(id, 'approved')} 
            onReject={(id) => handleAction(id, 'rejected')} 
          />
        ) : (
          <SalesRepView state={state} onAddTransaction={handleAddTransaction} />
        )}
      </main>

      {/* Mobile Sticky Bar for Sales Reps */}
      {state.currentUser.role === UserRole.SALES_REP && (
        <div className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-100 p-4 flex gap-4 z-40">
           <div className="flex-1 flex flex-col justify-center">
             <p className="text-[10px] text-slate-500">الرصيد الحالي</p>
             <p className="font-bold text-slate-800">
               {state.reps.find(r => r.id === state.currentUser?.id)?.currentBalance.toLocaleString()} ريال
             </p>
           </div>
           <button 
             className="w-12 h-12 bg-blue-600 rounded-2xl text-white flex items-center justify-center shadow-lg shadow-blue-500/40"
             onClick={() => {}}
           >
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
           </button>
        </div>
      )}
    </div>
  );
};

export default App;
