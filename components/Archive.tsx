
import React, { useState, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { Search, Eye, Hash, X, DownloadCloud, MessageCircle, Copy, Check, Trash2, AlertTriangle, Info, Printer, User, Calendar, Phone } from 'lucide-react';
import { Invoice, ViewType } from '../types';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const InvoiceTemplate: React.FC<{ invoice: Invoice }> = ({ invoice }) => {
  if (!invoice) return <div className="p-10 text-center text-rose-500 font-bold">خطأ في تحميل بيانات السند</div>;

  const items = Array.isArray(invoice.items) ? invoice.items : [];
  const subtotal = Number(invoice.totalBeforeDiscount) || 0;
  const isPercentage = invoice.discountType === 'percentage';
  const discountVal = Number(invoice.discountValue) || 0;
  const discountAmt = isPercentage ? (subtotal * discountVal / 100) : discountVal;
  const discountPerc = isPercentage ? discountVal : (subtotal > 0 ? ((discountVal / subtotal) * 100).toFixed(0) : 0);
  const netTotal = Number(invoice.netTotal) || 0;

  return (
    <div className="bg-white text-slate-800 w-full max-w-[210mm] mx-auto p-6 md:p-12 shadow-sm border border-slate-100 rounded-[1.5rem] select-text" dir="rtl" style={{ fontFamily: "'Cairo', sans-serif" }}>
      <div className="flex justify-between items-start mb-12">
        <div className="text-right">
          <h1 className="text-4xl font-black text-indigo-600 mb-1">ميزة</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase mr-1">سجلات الأرشيف الموثقة</p>
        </div>
        <div className="text-left bg-indigo-50 px-6 py-3 rounded-2xl border border-indigo-100 shadow-sm">
          <p className="text-[9px] font-black text-indigo-400 uppercase mb-1">حالة السجل</p>
          <p className="text-sm font-black text-indigo-700">سند مبيعات مؤرشف</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-12 py-8 border-y border-slate-100 mb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-indigo-600"><Hash size={14}/></div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase">رقم الفاتورة</p>
              <p className="text-sm font-black text-slate-700 select-all">#{invoice.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-indigo-600"><Calendar size={14}/></div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase">تاريخ الأرشفة</p>
              <p className="text-sm font-black text-slate-700">{invoice.date} | {invoice.time}</p>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-4 justify-end">
            <div className="text-left">
              <p className="text-[9px] font-black text-slate-400 uppercase">العميل</p>
              <p className="text-sm font-black text-slate-700">{invoice.customerName || 'عميل نقدي'}</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-indigo-600"><User size={14}/></div>
          </div>
          <div className="flex items-center gap-4 justify-end">
            <div className="text-left">
              <p className="text-[9px] font-black text-slate-400 uppercase">رقم الهاتف</p>
              <p className="text-sm font-black text-slate-700 select-all">{invoice.customerPhone || '---'}</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-indigo-600"><Phone size={14}/></div>
          </div>
        </div>
      </div>

      <div className="mb-12 overflow-hidden rounded-[1.5rem] border border-slate-100 shadow-sm">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-slate-50/50 text-slate-500 font-black text-[10px] uppercase">
              <th className="p-5">الصنف</th>
              <th className="p-5 text-center">السعر</th>
              <th className="p-5 text-center">الكمية</th>
              <th className="p-5 text-left">الإجمالي</th>
            </tr>
          </thead>
          <tbody className="text-xs font-bold text-slate-700 divide-y divide-slate-50">
            {items.map((item, idx) => (
              <tr key={idx}>
                <td className="p-5">{item.name}</td>
                <td className="p-5 text-center text-slate-400">{item.unitPrice.toLocaleString()}</td>
                <td className="p-5 text-center font-black">{item.quantity}</td>
                <td className="p-5 text-left font-black text-indigo-600">{item.subtotal.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col md:flex-row gap-8 justify-between items-start">
        <div className="flex-1 w-full md:max-w-xs space-y-4">
          {invoice.notes && (
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[9px] font-black text-slate-400 uppercase mb-2">ملاحظات مؤرشفة</p>
              <p className="text-[11px] font-bold text-slate-600 leading-relaxed italic">{invoice.notes}</p>
            </div>
          )}
        </div>
        <div className="w-full md:w-60 bg-indigo-50/50 p-5 rounded-[1.5rem] border border-indigo-100 space-y-4 shadow-sm">
          <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase">
            <span>الإجمالي:</span>
            <span>{subtotal.toLocaleString()} ج.م</span>
          </div>
          {discountAmt > 0 && (
            <div className="flex justify-between items-center text-[10px] font-black text-rose-500 pb-4 border-b border-indigo-100">
              <span>الخصم الممنوح:</span>
              <span>- {discountAmt.toLocaleString()} ج.م</span>
            </div>
          )}
          <div className="flex justify-between items-center pt-1">
            <span className="text-[11px] font-black text-slate-900">الصافي</span>
            <div className="text-xl font-black text-indigo-600">
              {netTotal.toLocaleString()} <span className="text-[10px] font-bold text-indigo-400">ج.م</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-20 pt-10 border-t border-dashed border-slate-200 text-center">
        <p className="text-[10px] font-black text-slate-400 uppercase mb-3">سجل مبيعات ميزة الموثق</p>
        <p className="text-[9px] font-bold text-slate-300 italic">نظام ميزة POS المتكامل</p>
      </div>
    </div>
  );
};

interface ArchiveProps {
  invoices: Invoice[];
  onDeleteInvoice: (id: string, reason: string, restoreStock: boolean) => void;
  onGoToView?: (view: ViewType) => void;
  onShowToast?: (message: string, type: 'success' | 'error') => void;
}

const Archive: React.FC<ArchiveProps> = ({ invoices, onDeleteInvoice, onGoToView, onShowToast }) => {
  const [search, setSearch] = useState('');
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{id: string, reason: string} | null>(null);
  const [restoreStock, setRestoreStock] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeInvoices = useMemo(() => invoices.filter(inv => !inv.isDeleted), [invoices]);
  const filtered = activeInvoices.filter(inv => inv.id.toLowerCase().includes(search.toLowerCase()) || inv.customerName?.toLowerCase().includes(search.toLowerCase()));

  const handleDownloadPDF = async (inv: Invoice) => {
    if (!inv) return;
    onShowToast?.("جاري تجهيز السجل...", "success");
    const container = document.createElement('div');
    container.style.position = 'absolute'; container.style.left = '-9999px'; container.style.top = '-9999px';
    container.style.width = '210mm';
    document.body.appendChild(container);
    const root = ReactDOM.createRoot(container);
    root.render(<InvoiceTemplate invoice={inv} />);
    await new Promise(resolve => setTimeout(resolve, 1500));
    try {
        const element = container.firstChild as HTMLElement;
        const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Meeza_Archive_${inv.id}.pdf`);
        onShowToast?.("تم حفظ السجل مؤرشفاً", "success");
    } catch (err) {
        onShowToast?.("حدث خطأ في استخراج PDF", "error");
    } finally {
        root.unmount(); document.body.removeChild(container);
    }
  };

  const handlePrint = (inv: Invoice) => {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed'; iframe.style.right = '100%'; iframe.style.bottom = '100%';
    iframe.style.width = '0'; iframe.style.height = '0'; iframe.style.border = 'none';
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow?.document;
    if (!doc) return;
    const subtotal = inv.totalBeforeDiscount || 0;
    const itemsHtml = (inv.items || []).map(item => `<tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 12px 0;">${item.name}</td><td style="padding: 12px 0; text-align: center;">${item.quantity}</td><td style="padding: 12px 0; text-align: left; font-weight: 800; color: #4f46e5;">${item.subtotal.toLocaleString()}</td></tr>`).join('');
    const html = `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;800;900&display=swap" rel="stylesheet"><style>body { font-family: 'Cairo', sans-serif; padding: 40px; color: #334155; line-height: 1.5; background: white; }.header { text-align: center; margin-bottom: 30px; }.brand { color: #4f46e5; font-size: 32px; font-weight: 900; margin: 0; }.badge { background: #0f172a; color: white; padding: 4px 12px; border-radius: 99px; font-size: 10px; font-weight: 800; display: inline-block; margin-top: 10px; }.info-grid { border-bottom: 1px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 20px; font-size: 12px; }.info-row { display: flex; justify-content: space-between; margin-bottom: 5px; }.label { color: #94a3b8; font-weight: 800; }.val { font-weight: 700; }table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; }th { border-bottom: 2px solid #f1f5f9; color: #94a3b8; font-weight: 800; padding: 10px 0; text-align: right; }.totals { border-top: 2px solid #f1f5f9; padding-top: 15px; font-size: 12px; }.total-row { display: flex; justify-content: space-between; margin-bottom: 8px; }.net-total { font-size: 18px; font-weight: 900; color: #4f46e5; border-top: 1px solid #f1f5f9; padding-top: 10px; margin-top: 10px; }.notes-box { background: #f8fafc; padding: 15px; border-radius: 12px; margin-top: 20px; font-size: 11px; border: 1px solid #f1f5f9; }.footer { margin-top: 40px; text-align: center; border-top: 1px dashed #cbd5e1; padding-top: 20px; color: #94a3b8; font-size: 10px; }</style></head><body><div class="header"><h1 class="brand">ميزة</h1><div class="badge">إيصال مبيعات مؤرشف</div></div><div class="info-grid"><div class="info-row"><span class="label">رقم الفاتورة:</span><span class="val" style="color:#4f46e5;">#${inv.id}</span></div><div class="info-row"><span class="label">تاريخ السند:</span><span class="val">${inv.date} - ${inv.time}</span></div><div class="info-row" style="border-top: 1px solid #f8fafc; margin-top: 5px; padding-top: 5px;"><span class="label">العميل:</span><span class="val">${inv.customerName || 'عميل نقدي'}</span></div></div><table><thead><tr><th>الصنف</th><th style="text-align:center;">الكمية</th><th style="text-align:left;">الإجمالي</th></tr></thead><tbody>${itemsHtml}</tbody></table><div class="totals"><div class="total-row"><span class="label">الإجمالي:</span><span class="val">${subtotal.toLocaleString()} ج.م</span></div><div class="total-row net-total"><span>الصافي النهائي</span><span>${inv.netTotal.toLocaleString()} ج.م</span></div></div></body></html>`;
    doc.open(); doc.write(html); doc.close();
    iframe.onload = () => {
      try { iframe.contentWindow?.focus(); iframe.contentWindow?.print(); setTimeout(() => { if (document.body.contains(iframe)) document.body.removeChild(iframe); }, 1000); } catch (err) {}
    };
  };

  const handleDelete = () => {
    if (!confirmDelete || !confirmDelete.id) return;
    onDeleteInvoice(confirmDelete.id, confirmDelete.reason, restoreStock);
    onShowToast?.("تم نقل الفاتورة إلى سلة المحذوفات", "success");
    setConfirmDelete(null);
  };

  return (
    <div className="space-y-8 animate-in font-['Cairo'] no-print select-text" dir="rtl">
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 flex flex-col md:flex-row gap-6 items-center justify-between no-print h-auto md:h-24">
        <div className="relative flex-1"><Search className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="text" placeholder="ابحث برقم الفاتورة أو العميل..." className="w-full pr-14 pl-4 py-3 bg-slate-50 rounded-xl outline-none font-bold text-sm" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        <div className="px-6 py-3 bg-indigo-50 text-indigo-700 rounded-xl text-[10px] font-black border border-indigo-100"><Hash size={16} className="inline mr-2" /> السجلات: {activeInvoices.length}</div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-[10px] min-w-[1000px]">
            <thead className="bg-slate-50 text-slate-500 font-black uppercase text-[8px] border-b">
              <tr>
                <th className="px-6 py-5">رقم السند</th>
                <th className="px-6 py-5">تاريخ ووقت</th>
                <th className="px-6 py-5">العميل</th>
                <th className="px-6 py-5 text-center">الإجمالي</th>
                <th className="px-6 py-5 text-center">الخصم</th>
                <th className="px-6 py-5 text-center">الصافي</th>
                <th className="px-6 py-5 text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-bold">
              {filtered.map(inv => {
                  const discountAmt = inv.totalBeforeDiscount - inv.netTotal;
                  const discountPerc = inv.totalBeforeDiscount > 0 ? ((discountAmt / inv.totalBeforeDiscount) * 100).toFixed(0) : 0;
                  return (
                  <tr key={inv.id} className="hover:bg-slate-50/50 transition-all">
                    <td className="px-6 py-4">
                      <button onClick={() => {navigator.clipboard.writeText(inv.id); setCopiedId(inv.id); setTimeout(()=>setCopiedId(null),2000)}} className="flex items-center gap-2 text-indigo-600 font-black px-2 py-1 rounded hover:bg-indigo-50 transition-all group">
                        #{inv.id}
                        {copiedId === inv.id ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} className="opacity-0 group-hover:opacity-30 transition-opacity" />}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-slate-400">{inv.date} | {inv.time}</td>
                    <td className="px-6 py-4 text-slate-800">{inv.customerName || 'نقدي'}</td>
                    <td className="px-6 py-4 text-center text-slate-400">{inv.totalBeforeDiscount.toLocaleString()} ج.م</td>
                    <td className="px-6 py-4 text-center text-rose-500">
                      <span className="font-black">{discountAmt.toLocaleString()} ج.م</span>
                      <span className="text-[9px] font-black block opacity-60">({discountPerc}%)</span>
                    </td>
                    <td className="px-6 py-4 text-center font-black text-slate-900">{inv.netTotal.toLocaleString()} ج.م</td>
                    <td className="px-6 py-4 text-left">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => setPreviewInvoice({...inv})} className="p-2 bg-slate-100 text-slate-400 rounded-lg hover:bg-indigo-600 hover:text-white transition-all"><Eye size={16} /></button>
                        <button onClick={() => handleDownloadPDF(inv)} className="p-2 bg-slate-100 text-slate-400 rounded-lg hover:bg-indigo-700 hover:text-white transition-all"><DownloadCloud size={16} /></button>
                        <button onClick={() => setConfirmDelete({id: inv.id, reason: ''})} className="p-2 bg-slate-100 text-slate-300 rounded-lg hover:bg-rose-600 hover:text-white transition-all"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
              )})}
            </tbody>
          </table>
        </div>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[500] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm shadow-2xl overflow-hidden animate-in">
            <div className="p-8 text-center bg-rose-50"><AlertTriangle className="mx-auto mb-4 text-rose-600" size={40}/><h3 className="text-xl font-black mb-2 text-slate-800">نقل للسلة؟</h3><textarea autoFocus value={confirmDelete.reason} onChange={e => setConfirmDelete({...confirmDelete, reason: e.target.value})} className="w-full p-3 rounded-xl border border-rose-200 outline-none font-bold text-xs min-h-[80px]" placeholder="سبب الحذف..." /></div>
            <div className="p-5 flex gap-3 border-t border-slate-50"><button onClick={() => setConfirmDelete(null)} className="flex-1 py-2 bg-slate-100 rounded-xl font-black text-[10px]">تراجع</button><button onClick={handleDelete} disabled={!confirmDelete.reason.trim()} className="flex-1 py-2 bg-rose-600 text-white rounded-xl font-black text-[10px] active:scale-95 transition-all">تأكيد</button></div>
          </div>
        </div>
      )}

      {previewInvoice && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[1000] flex items-center justify-center p-4 md:p-8 animate-in transition-all">
          <div className="bg-white rounded-[2.5rem] w-full max-w-[900px] max-h-[90vh] shadow-2xl overflow-hidden flex flex-col">
             <div className="p-6 border-b bg-indigo-600 text-white flex justify-between items-center shrink-0">
                <div className="flex items-center gap-4"><div className="p-2.5 bg-white/20 rounded-xl border border-white/30"><Eye size={20}/></div><div><h3 className="font-black text-base">معاينة أرشيف ميزة</h3><p className="text-[10px] font-bold opacity-70 mt-0.5">سجل رقم {previewInvoice.id}</p></div></div>
                <button onClick={() => setPreviewInvoice(null)} className="p-3 hover:bg-white/10 rounded-2xl transition-all"><X size={24}/></button>
             </div>
             <div className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-12 scrollbar-hide">
                <div className="max-w-[210mm] mx-auto origin-top"><InvoiceTemplate invoice={previewInvoice} /></div>
             </div>
             <div className="p-6 bg-white border-t border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between no-print shrink-0">
                <div className="flex items-center gap-3 w-full md:w-auto">
                   <button onClick={() => handleDownloadPDF(previewInvoice)} className="flex-1 md:flex-none px-8 py-2.5 bg-indigo-600 text-white font-black rounded-xl text-[10px] flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all active:scale-95"><DownloadCloud size={16} /> تحميل PDF</button>
                   <button onClick={() => handlePrint(previewInvoice)} className="flex-1 md:flex-none px-8 py-2.5 bg-slate-800 text-white font-black rounded-xl text-[10px] flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-95"><Printer size={16} /> طباعة</button>
                </div>
                <button onClick={() => setPreviewInvoice(null)} className="w-full md:w-auto px-8 py-2.5 bg-slate-100 text-slate-500 font-black rounded-xl text-[10px] hover:bg-slate-200 transition-all">إغلاق</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Archive;
