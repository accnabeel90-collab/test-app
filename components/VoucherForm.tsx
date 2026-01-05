
import React, { useState } from 'react';
import { VoucherType, Transaction } from '../types';

interface VoucherFormProps {
  type: VoucherType;
  onSubmit: (data: Partial<Transaction>) => void;
  onCancel: () => void;
}

const VoucherForm: React.FC<VoucherFormProps> = ({ type, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    amount: '',
    customerName: '',
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.customerName) return;

    onSubmit({
      type,
      amount: parseFloat(formData.amount),
      customerName: formData.customerName,
      description: formData.description,
      date: new Date().toISOString(),
      status: 'pending'
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className={`p-6 ${type === VoucherType.RECEIPT ? 'bg-emerald-600' : 'bg-rose-600'} text-white`}>
          <h2 className="text-xl font-bold text-center">
            {type === VoucherType.RECEIPT ? 'سند قبض جديد' : 'سند صرف جديد'}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">المبلغ (ريال)</label>
            <input
              type="number"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {type === VoucherType.RECEIPT ? 'اسم العميل' : 'الجهة المصروف لها'}
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="أدخل الاسم..."
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">البيان / السبب</label>
            <textarea
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              rows={3}
              placeholder="اكتب التفاصيل هنا..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className={`flex-1 py-4 rounded-xl font-bold text-white shadow-lg transform active:scale-95 transition-all ${
                type === VoucherType.RECEIPT ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              حفظ السند
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-4 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VoucherForm;
