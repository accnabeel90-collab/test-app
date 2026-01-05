
import React, { useState, useEffect } from 'react';
import { AppState, Transaction, SalesRep, VoucherType } from '../types';
import StatsCard from './StatsCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getFinancialSummary } from '../services/geminiService';

interface DashboardProps {
  state: AppState;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

const FinancialDashboard: React.FC<DashboardProps> = ({ state, onApprove, onReject }) => {
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);

  const totalReceipts = state.transactions
    .filter(t => t.type === VoucherType.RECEIPT && t.status === 'approved')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalPayments = state.transactions
    .filter(t => t.type === VoucherType.PAYMENT && t.status === 'approved')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingCount = state.transactions.filter(t => t.status === 'pending').length;

  const handleAiAnalyze = async () => {
    setLoadingAi(true);
    const summary = await getFinancialSummary(state.transactions, state.reps);
    
    if (summary === "ERROR_KEY_NOT_FOUND") {
      setAiAnalysis("حدث خطأ في صلاحية المفتاح. يرجى إعادة ضبط إعدادات الـ API.");
      // In a real app, you might trigger window.location.reload() or reset key state here
    } else {
      setAiAnalysis(summary || '');
    }
    setLoadingAi(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">لوحة تحكم المدير المالي</h1>
          <p className="text-slate-500">مراقبة حركات الصناديق والتدفقات النقدية للمندوبين</p>
        </div>
        <button 
          onClick={handleAiAnalyze}
          disabled={loadingAi}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-2xl shadow-lg hover:opacity-90 transition-all disabled:opacity-50"
        >
          {loadingAi ? 'جاري التحليل...' : '✨ تحليل الذكاء الاصطناعي Pro'}
        </button>
      </header>

      {aiAnalysis && (
        <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-3xl animate-in slide-in-from-top-4 duration-300">
          <h3 className="text-indigo-900 font-bold mb-3 flex items-center gap-2">
            <span>✨</span> تقرير ذكاء الأعمال المتقدم:
          </h3>
          <div className="text-indigo-800 whitespace-pre-line leading-relaxed text-sm md:text-base">
            {aiAnalysis}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="إجمالي المقبوضات المعتمدة" 
          value={`${totalReceipts.toLocaleString()} ريال`} 
          color="bg-emerald-100 text-emerald-600"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>}
        />
        <StatsCard 
          title="إجمالي المصروفات المعتمدة" 
          value={`${totalPayments.toLocaleString()} ريال`} 
          color="bg-rose-100 text-rose-600"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" /></svg>}
        />
        <StatsCard 
          title="النقد المتوفر في العهد" 
          value={`${(totalReceipts - totalPayments).toLocaleString()} ريال`} 
          color="bg-blue-100 text-blue-600"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
        />
        <StatsCard 
          title="سندات بانتظار الاعتماد" 
          value={pendingCount} 
          color="bg-amber-100 text-amber-600"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">أرصدة المندوبين الحالية</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={state.reps}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="currentBalance" radius={[8, 8, 0, 0]}>
                  {state.reps.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.currentBalance >= 0 ? '#10b981' : '#f43f5e'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-4">طلبات الاعتماد الأخيرة</h3>
          <div className="flex-1 space-y-4 overflow-y-auto max-h-[300px] pr-2">
            {state.transactions.filter(t => t.status === 'pending').map((t) => (
              <div key={t.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className={`text-xs px-2 py-1 rounded-full ${t.type === VoucherType.RECEIPT ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {t.type === VoucherType.RECEIPT ? 'قبض' : 'صرف'}
                    </span>
                    <h4 className="font-bold text-slate-800 mt-1">{t.amount} ريال</h4>
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-slate-500">{t.representativeName}</p>
                    <p className="text-[10px] text-slate-400">{new Date(t.date).toLocaleTimeString('ar-SA')}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600 line-clamp-1">{t.description}</p>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => onApprove(t.id)} className="flex-1 bg-emerald-600 text-white text-xs py-2 rounded-lg hover:bg-emerald-700 transition-colors">اعتماد</button>
                  <button onClick={() => onReject(t.id)} className="flex-1 bg-rose-100 text-rose-600 text-xs py-2 rounded-lg hover:bg-rose-200 transition-colors">رفض</button>
                </div>
              </div>
            ))}
            {pendingCount === 0 && <p className="text-center text-slate-400 py-10">لا توجد طلبات معلقة</p>}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800">سجل العمليات الأخير</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 text-slate-500 text-sm">
              <tr>
                <th className="px-6 py-4 font-medium">العملية</th>
                <th className="px-6 py-4 font-medium">المندوب</th>
                <th className="px-6 py-4 font-medium">المبلغ</th>
                <th className="px-6 py-4 font-medium">التاريخ</th>
                <th className="px-6 py-4 font-medium">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {state.transactions.slice(0, 10).map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-800">{t.customerName}</span>
                      <span className="text-xs text-slate-500">{t.description}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{t.representativeName}</td>
                  <td className="px-6 py-4">
                    <span className={t.type === VoucherType.RECEIPT ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                      {t.type === VoucherType.RECEIPT ? '+' : '-'}{t.amount} ريال
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-sm">{new Date(t.date).toLocaleDateString('ar-SA')}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-3 py-1 rounded-full ${
                      t.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                      t.status === 'rejected' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {t.status === 'approved' ? 'معتمد' : t.status === 'rejected' ? 'مرفوض' : 'معلق'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FinancialDashboard;
