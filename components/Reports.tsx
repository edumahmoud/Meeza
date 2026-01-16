
import React, { useState, useMemo } from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  RotateCcw, 
  TrendingUp, 
  Hash, 
  ShoppingBag, 
  PieChart as PieIcon, 
  FileSpreadsheet,
  Wallet,
  Coins,
  BarChart as BarChartIcon,
  Activity,
  ArrowUpRight,
  TrendingDown
} from 'lucide-react';
import { Invoice, ReturnRecord, Expense } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, 
  LineChart, Line, AreaChart, Area, Legend
} from 'recharts';

declare const XLSX: any;

interface ReportsProps {
  invoices: Invoice[];
  returns: ReturnRecord[];
  expenses: Expense[];
}

const Reports: React.FC<ReportsProps> = ({ invoices, returns, expenses }) => {
  const [activeTab, setActiveTab] = useState<'daily' | 'monthly' | 'yearly'>('daily');
  const [selectedDate, setSelectedDate] = useState(new Date());

  const formattedSelectedDate = selectedDate.toLocaleDateString('ar-EG');
  
  const dateDisplayLabel = useMemo(() => {
    if (activeTab === 'daily') return formattedSelectedDate;
    if (activeTab === 'monthly') return selectedDate.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' });
    return selectedDate.toLocaleDateString('ar-EG', { year: 'numeric' });
  }, [activeTab, selectedDate, formattedSelectedDate]);

  const changePeriod = (delta: number) => {
    const newDate = new Date(selectedDate);
    if (activeTab === 'daily') newDate.setDate(selectedDate.getDate() + delta);
    else if (activeTab === 'monthly') newDate.setMonth(selectedDate.getMonth() + delta);
    else newDate.setFullYear(selectedDate.getFullYear() + delta);
    setSelectedDate(newDate);
  };

  const filteredData = useMemo(() => {
    return {
      invoices: invoices.filter(inv => {
        const d = new Date(inv.timestamp);
        if (activeTab === 'daily') return inv.date === formattedSelectedDate;
        if (activeTab === 'monthly') return d.getMonth() === selectedDate.getMonth() && d.getFullYear() === selectedDate.getFullYear();
        return d.getFullYear() === selectedDate.getFullYear();
      }),
      returns: returns.filter(ret => {
        const d = new Date(ret.timestamp);
        if (activeTab === 'daily') return ret.date === formattedSelectedDate;
        if (activeTab === 'monthly') return d.getMonth() === selectedDate.getMonth() && d.getFullYear() === selectedDate.getFullYear();
        return d.getFullYear() === selectedDate.getFullYear();
      }),
      expenses: expenses.filter(exp => {
        const d = new Date(exp.timestamp);
        if (activeTab === 'daily') return exp.date === formattedSelectedDate;
        if (activeTab === 'monthly') return d.getMonth() === selectedDate.getMonth() && d.getFullYear() === selectedDate.getFullYear();
        return d.getFullYear() === selectedDate.getFullYear();
      })
    };
  }, [invoices, returns, expenses, activeTab, formattedSelectedDate, selectedDate]);

  const stats = useMemo(() => {
    const invs = filteredData.invoices; const rets = filteredData.returns; const exps = filteredData.expenses;
    const transactionCount = invs.length;
    const unitsSold = invs.reduce((acc, inv) => acc + inv.items.reduce((iAcc, item) => iAcc + item.quantity, 0), 0);
    const netRevenue = invs.reduce((a, b) => a + b.netTotal, 0);
    const totalRefunds = rets.reduce((a, b) => a + b.totalRefund, 0);
    const totalExpenses = exps.reduce((a, b) => a + b.amount, 0);
    const totalSoldCOGS = invs.reduce((acc, inv) => acc + inv.items.reduce((iAcc, item) => iAcc + (item.quantity * item.wholesalePriceAtSale), 0), 0);
    const totalReturnedCOGS = rets.reduce((acc, ret) => acc + ret.items.reduce((iAcc, item) => iAcc + (item.quantity * (item.wholesalePriceAtSale || 0)), 0), 0);
    const netCOGS = totalSoldCOGS - totalReturnedCOGS;
    const netProfit = (netRevenue - totalRefunds) - netCOGS - totalExpenses;
    return { transactionCount, unitsSold, netRevenue, totalRefunds, totalExpenses, netProfit };
  }, [filteredData]);

  const chartsData = useMemo(() => {
    const trend: any[] = [];
    if (activeTab === 'daily') {
      for (let i = 0; i < 24; i++) {
        const hourInvoices = filteredData.invoices.filter(inv => new Date(inv.timestamp).getHours() === i);
        const hourExpenses = filteredData.expenses.filter(exp => new Date(exp.timestamp).getHours() === i);
        trend.push({ name: `${i}:00`, revenue: hourInvoices.reduce((a, b) => a + b.netTotal, 0), expenses: hourExpenses.reduce((a, b) => a + b.amount, 0), count: hourInvoices.length });
      }
    } else if (activeTab === 'monthly') {
      const days = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
      for (let i = 1; i <= days; i++) {
        const dayInvoices = filteredData.invoices.filter(inv => new Date(inv.timestamp).getDate() === i);
        const dayExpenses = filteredData.expenses.filter(exp => new Date(exp.timestamp).getDate() === i);
        trend.push({ name: i.toString(), revenue: dayInvoices.reduce((a, b) => a + b.netTotal, 0), expenses: dayExpenses.reduce((a, b) => a + b.amount, 0), count: dayInvoices.length });
      }
    } else {
      const monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
      for (let i = 0; i < 12; i++) {
        const monthInvoices = filteredData.invoices.filter(inv => new Date(inv.timestamp).getMonth() === i);
        const monthExpenses = filteredData.expenses.filter(exp => new Date(exp.timestamp).getMonth() === i);
        trend.push({ name: monthNames[i], revenue: monthInvoices.reduce((a, b) => a + b.netTotal, 0), expenses: monthExpenses.reduce((a, b) => a + b.amount, 0), count: monthInvoices.length });
      }
    }
    const productMap: Record<string, {name: string, value: number}> = {};
    filteredData.invoices.forEach(inv => inv.items.forEach(item => { if (!productMap[item.productId]) productMap[item.productId] = { name: item.name, value: 0 }; productMap[item.productId].value += item.quantity; }));
    const topProducts = Object.values(productMap).sort((a, b) => b.value - a.value).slice(0, 5);
    return { trend, topProducts };
  }, [filteredData, activeTab, selectedDate]);

  return (
    <div className="space-y-6 md:space-y-10 animate-in pb-12 font-['Cairo']" dir="rtl">
      {/* Header Container Optimized for Tablet */}
      <div className="bg-white p-5 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 no-print">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 w-full">
          <div className="flex bg-slate-100 p-2 rounded-2xl flex-1 md:max-w-md">
            {['daily', 'monthly', 'yearly'].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab as any)} className={`flex-1 px-4 py-3 rounded-xl text-[11px] font-black transition-all ${activeTab === tab ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-indigo-600'}`}>{tab === 'daily' ? 'يومي' : tab === 'monthly' ? 'شهري' : 'سنوي'}</button>
            ))}
          </div>
          <div className="flex items-center justify-between gap-6 bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100">
              <button onClick={() => changePeriod(-1)} className="p-1 hover:bg-white rounded-xl text-indigo-600 transition-all"><ChevronRight size={24}/></button>
              <span className="text-sm md:text-base font-black text-slate-700 min-w-[140px] text-center tracking-tight">{dateDisplayLabel}</span>
              <button onClick={() => changePeriod(1)} className="p-1 hover:bg-white rounded-xl text-indigo-600 transition-all"><ChevronLeft size={24}/></button>
          </div>
          <button onClick={() => {}} className="flex items-center justify-center gap-3 px-8 py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 shadow-xl text-xs transition-all active:scale-95"><FileSpreadsheet size={18} />تصدير التقرير</button>
        </div>
      </div>

      {/* Grid Optimized for Tablet: 2 cols on small, 3 cols on medium (tablet), 6 on large */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
        {[
          { label: 'الفواتير', val: stats.transactionCount, icon: Hash, color: 'text-indigo-600', bg: 'bg-indigo-50', desc: 'إجمالي المعاملات' },
          { label: 'القطع المباعة', val: stats.unitsSold, icon: ShoppingBag, color: 'text-emerald-600', bg: 'bg-emerald-50', desc: 'حجم المبيعات' },
          { label: 'إجمالي المبيعات', val: stats.netRevenue.toLocaleString(), icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50', desc: 'إيرادات نقدية' },
          { label: 'المرتجعات', val: stats.totalRefunds.toLocaleString(), icon: RotateCcw, color: 'text-rose-600', bg: 'bg-rose-50', desc: 'مبالغ مستردة' },
          { label: 'المصاريف', val: stats.totalExpenses.toLocaleString(), icon: Wallet, color: 'text-orange-600', bg: 'bg-orange-50', desc: 'نفقات الفترة' },
          { label: 'صافي الربح', val: stats.netProfit.toLocaleString(), icon: Coins, color: 'text-white', bg: 'bg-indigo-600', desc: 'الربح الحقيقي' }
        ].map((s, i) => (
          <div key={i} className={`p-6 rounded-[2rem] border border-slate-100 shadow-sm ${s.bg} flex flex-col justify-between transition-all hover:shadow-lg h-full min-h-[140px]`}>
             <div className="flex justify-between items-start mb-4">
                <div className={`p-2.5 rounded-xl ${s.bg === 'bg-indigo-600' ? 'bg-white/20' : 'bg-white shadow-sm'} shrink-0`}><s.icon size={20} className={s.color.includes('white') ? 'text-white' : s.color}/></div>
                <div className="text-left min-w-0"><p className={`text-[8px] font-black uppercase tracking-widest opacity-60 truncate ${s.bg === 'bg-indigo-600' ? 'text-white' : 'text-slate-400'}`}>{s.label}</p></div>
             </div>
             <div className="text-right">
               <h2 className={`text-lg md:text-xl font-black mb-1 truncate ${s.bg === 'bg-indigo-600' ? 'text-white' : 'text-slate-800'}`}>{s.val} <span className="text-[10px] opacity-70">ج.م</span></h2>
               <p className={`text-[9px] font-bold truncate ${s.bg === 'bg-indigo-600' ? 'text-white/60' : 'text-slate-400'}`}>{s.desc}</p>
             </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-10 max-w-5xl mx-auto w-full">
         <div className="bg-white p-6 md:p-12 rounded-[2.5rem] border border-slate-100 shadow-sm w-full">
            <div className="text-center mb-10"><h3 className="text-lg md:text-xl font-black text-slate-800">مقارنة الإيرادات والمصروفات</h3><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">تحليل السيولة النقدية للفترة</p></div>
            <div className="min-h-[350px] w-full">
               <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={chartsData.trend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                     <defs><linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15}/><stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/></linearGradient><linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15}/><stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/></linearGradient></defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 'bold'}} /><YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 'bold'}} /><Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', textAlign: 'right', fontWeight: 'bold', fontFamily: 'Cairo'}} /><Legend iconType="circle" wrapperStyle={{paddingTop: '30px', fontSize: '11px', fontWeight: 'bold'}} /><Area type="monotone" dataKey="revenue" name="المبيعات" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" /><Area type="monotone" dataKey="expenses" name="المصاريف" stroke="#f43f5e" strokeWidth={4} fillOpacity={1} fill="url(#colorExpense)" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Reports;
