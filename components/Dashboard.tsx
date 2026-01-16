
import React from 'react';
import { 
  TrendingUp, 
  Package, 
  BarChart3 as BarIcon,
  Briefcase,
  LayoutDashboard,
  Wallet,
  ArrowUpRight
} from 'lucide-react';
import { Invoice, ReturnRecord, Expense, Product } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  invoices: Invoice[];
  returns: ReturnRecord[];
  expenses: Expense[];
  products: Product[];
  onProductClick?: (product: Product) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ invoices, returns, expenses, products, onProductClick }) => {
  const totalSalesRevenue = invoices.reduce((acc, inv) => acc + inv.netTotal, 0);
  const totalRefunds = returns.reduce((acc, ret) => acc + ret.totalRefund, 0);
  const totalExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0);
  
  const cashOnHand = totalSalesRevenue - totalRefunds - totalExpenses;
  const inventoryValue = products.reduce((acc, p) => acc + (p.stock * p.wholesalePrice), 0);
  
  const totalSoldCOGS = invoices.reduce((acc, inv) => {
    return acc + inv.items.reduce((iAcc, item) => iAcc + (item.quantity * item.wholesalePriceAtSale), 0);
  }, 0);
  
  const totalReturnedCOGS = returns.reduce((acc, ret) => {
    return acc + ret.items.reduce((iAcc, item) => iAcc + (item.quantity * (item.wholesalePriceAtSale || 0)), 0);
  }, 0);

  const netCOGS = totalSoldCOGS - totalReturnedCOGS;
  const netRevenue = totalSalesRevenue - totalRefunds;
  const grossProfit = netRevenue - netCOGS;
  const netProfit = grossProfit - totalExpenses;
  const profitMargin = netRevenue > 0 ? (netProfit / netRevenue) * 100 : 0;

  const productPerformance = invoices.reduce((acc: Record<string, {name: string, qty: number, revenue: number}>, inv) => {
    inv.items.forEach(item => {
      if (!acc[item.productId]) {
        acc[item.productId] = { name: item.name, qty: 0, revenue: 0 };
      }
      acc[item.productId].qty += item.quantity;
      acc[item.productId].revenue += item.subtotal;
    });
    return acc;
  }, {});

  const topSelling = (Object.values(productPerformance) as any[])
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  const stats = [
    { label: 'صافي الخزينة (نقدي)', value: `${cashOnHand.toLocaleString()} ج.م`, icon: Wallet, color: 'bg-emerald-600', trend: 'سيولة', isUp: cashOnHand >= 0, description: 'المبيعات - (المرتجعات + المصاريف)' },
    { label: 'قيمة المخزون (تكلفة)', value: `${inventoryValue.toLocaleString()} ج.م`, icon: Briefcase, color: 'bg-indigo-600', trend: 'رأس مال', isUp: true, description: 'تكلفة البضاعة المتاحة حالياً' },
    { label: 'صافي الربح الفعلي', value: `${netProfit.toLocaleString()} ج.م`, icon: TrendingUp, color: 'bg-blue-600', trend: 'أرباح', isUp: netProfit >= 0, description: 'الربح بعد خصم التكلفة والمصاريف' },
    { label: 'نسبة العائد الربحي', value: `${profitMargin.toFixed(1)}%`, icon: BarIcon, color: 'bg-amber-600', trend: 'كفاءة', isUp: profitMargin > 0, description: 'الربح المكتسب لكل جنيه مبيعات' },
  ];

  return (
    <div className="space-y-6 md:space-y-8 animate-in" dir="rtl">
      <div className="bg-white p-5 md:p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between no-print h-auto md:h-24">
         <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 border border-indigo-100 shrink-0">
               <LayoutDashboard size={20} />
            </div>
            <div className="min-w-0 text-right">
               <h3 className="font-black text-slate-800 text-sm md:text-base leading-none truncate">مؤشرات أداء ميزة POS</h3>
               <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">تحليل شامل ومباشر</p>
            </div>
         </div>
         <div className="w-full md:w-auto flex items-center justify-center md:justify-end gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 text-[9px] font-black text-slate-500 uppercase tracking-widest">
            آخر تحديث: {new Date().toLocaleTimeString('ar-EG', {hour: '2-digit', minute:'2-digit'})}
         </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-lg transition-all group overflow-hidden relative">
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-5">
                <div className={`p-3 rounded-2xl ${stat.color} text-white shadow-xl group-hover:scale-110 transition-transform shrink-0`}>
                  <stat.icon size={22} />
                </div>
                <div className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-tighter ${stat.isUp ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                  {stat.trend}
                </div>
              </div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight mb-2 truncate">{stat.value}</h3>
              <p className="text-[9px] text-slate-400 font-bold leading-relaxed line-clamp-1">{stat.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Chart Area Optimized for Tablet */}
      <div className="bg-white p-6 md:p-12 rounded-[2.5rem] border border-slate-100 shadow-sm max-w-5xl mx-auto w-full overflow-hidden">
        <div className="text-center mb-10">
          <h3 className="text-lg md:text-xl font-black text-slate-800">الأكثر مبيعاً هذا الشهر</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">تحليل حركة الأصناف الأكثر رواجاً</p>
        </div>
        <div className="min-h-[300px] md:min-h-[400px] w-full flex items-center justify-center">
          {topSelling.length > 0 ? (
            <ResponsiveContainer width="100%" height={window.innerWidth < 1024 ? 350 : 400}>
              <BarChart data={topSelling} layout="horizontal" margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11, fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11, fontWeight: 'bold'}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', textAlign: 'right', fontWeight: 'bold', fontSize: '11px', fontFamily: 'Cairo'}}
                />
                <Bar dataKey="qty" radius={[12, 12, 0, 0]} barSize={window.innerWidth < 1024 ? 40 : 50}>
                  {topSelling.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#4f46e5' : '#818cf8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-300 font-black text-xs uppercase tracking-widest">لا توجد بيانات كافية للرسم البياني</p>
          )}
        </div>
      </div>

      <div className="bg-white p-6 md:p-12 rounded-[2.5rem] border border-slate-100 shadow-sm max-w-3xl mx-auto w-full">
        <h3 className="text-lg md:text-xl font-black text-slate-800 mb-10 text-center">نواقص المخزن (حرجة)</h3>
        <div className="space-y-8">
          {products.length > 0 ? products.filter(p => !p.isDeleted).sort((a,b) => a.stock - b.stock).slice(0, 5).map((p, i) => {
            const stockPercent = Math.min(100, (p.stock / 20) * 100);
            return (
              <div key={i} className="space-y-4 cursor-pointer group/item" onClick={() => onProductClick?.(p)}>
                <div className="flex justify-between items-end text-[12px]">
                  <div className="flex flex-col text-right">
                    <span className="font-black text-slate-700 group-hover/item:text-indigo-600 transition-colors text-sm md:text-base">{p.name}</span>
                    <span className="text-[10px] text-slate-400 font-bold truncate max-w-[250px]">{p.description || '-'}</span>
                  </div>
                  <span className={`font-black text-sm ${p.stock < 5 ? 'text-rose-600' : 'text-slate-500'}`}>{p.stock} قطعة</span>
                </div>
                <div className="w-full h-3 md:h-4 bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner">
                  <div className={`h-full rounded-full transition-all duration-1000 ${p.stock < 5 ? 'bg-gradient-to-l from-rose-500 to-rose-400' : 'bg-gradient-to-l from-emerald-500 to-emerald-400'}`} style={{ width: `${stockPercent}%` }} />
                </div>
              </div>
            );
          }) : (
            <p className="text-center text-slate-300 py-16 font-black uppercase text-[10px] tracking-widest italic">لا توجد منتجات مسجلة</p>
          )}
        </div>
        <div className="mt-10 pt-10 border-t border-slate-50 flex justify-center">
           <div className="flex items-center gap-5 p-6 bg-slate-50/50 rounded-3xl border border-slate-100 w-full max-w-sm">
             <div className="w-12 h-12 bg-white text-indigo-600 rounded-2xl flex items-center justify-center shadow-md border border-slate-100 shrink-0">
                <Package size={24} />
             </div>
             <div className="min-w-0 text-right">
               <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1.5">إجمالي الأصناف</p>
               <p className="text-2xl font-black text-slate-800 leading-none">{products.length} صنف</p>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
