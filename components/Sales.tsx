
import React, { useState, useMemo, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { 
  Search, ShoppingCart, Trash2, Plus, Minus, Save, User, Phone, Tag, X, Eye, 
  History, FileText, DownloadCloud, MessageCircle, Copy, Check, AlertCircle, Info, UserCheck, Printer,
  Hash, Calendar, Camera, ScanLine
} from 'lucide-react';
import { Product, SaleItem, Invoice, ViewType } from '../types';
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
          <p className="text-[10px] font-black text-slate-400 uppercase mr-1">نظام المبيعات الذكي</p>
        </div>
        <div className="text-left bg-indigo-50 px-6 py-3 rounded-2xl border border-indigo-100 shadow-sm">
          <p className="text-[9px] font-black text-indigo-400 uppercase mb-1">نوع السند</p>
          <p className="text-sm font-black text-indigo-700">سند مبيعات رقمي</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-12 py-8 border-y border-slate-100 mb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-indigo-600"><Hash size={14}/></div>
            <div><p className="text-[9px] font-black text-slate-400 uppercase">رقم الفاتورة</p><p className="text-sm font-black text-slate-700 select-all">#{invoice.id}</p></div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-indigo-600"><Calendar size={14}/></div>
            <div><p className="text-[9px] font-black text-slate-400 uppercase">التاريخ والوقت</p><p className="text-sm font-black text-slate-700">{invoice.date} | {invoice.time}</p></div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-4 justify-end">
            <div className="text-left"><p className="text-[9px] font-black text-slate-400 uppercase">العميل</p><p className="text-sm font-black text-slate-700">{invoice.customerName || 'عميل نقدي'}</p></div>
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-indigo-600"><User size={14}/></div>
          </div>
          <div className="flex items-center gap-4 justify-end">
            <div className="text-left"><p className="text-[9px] font-black text-slate-400 uppercase">رقم الهاتف</p><p className="text-sm font-black text-slate-700 select-all">{invoice.customerPhone || '---'}</p></div>
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-indigo-600"><Phone size={14}/></div>
          </div>
        </div>
      </div>
      <div className="mb-12 overflow-hidden rounded-[1.5rem] border border-slate-100 shadow-sm">
        <table className="w-full text-right border-collapse">
          <thead><tr className="bg-slate-50/50 text-slate-500 font-black text-[10px] uppercase"><th className="p-5">الصنف</th><th className="p-5 text-center">السعر</th><th className="p-5 text-center">الكمية</th><th className="p-5 text-left">الإجمالي</th></tr></thead>
          <tbody className="text-xs font-bold text-slate-700 divide-y divide-slate-50">
            {items.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                <td className="p-5">{item.name}</td>
                <td className="p-5 text-center text-slate-500">{item.unitPrice.toLocaleString()}</td>
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
              <p className="text-[9px] font-black text-slate-400 uppercase mb-2">ملاحظات إضافية</p>
              <p className="text-[11px] font-bold text-slate-600 leading-relaxed italic">{invoice.notes}</p>
            </div>
          )}
        </div>
        <div className="w-full md:w-60 bg-indigo-50/50 p-5 rounded-[1.5rem] border border-indigo-100 space-y-4 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase"><span>الإجمالي:</span><span className="text-slate-600">{subtotal.toLocaleString()} ج.م</span></div>
          {discountAmt > 0 && <div className="flex justify-between items-center text-[10px] font-black text-rose-500 pb-4 border-b border-indigo-100"><span>الخصم ({discountPerc}%):</span><span>- {discountAmt.toLocaleString()} ج.م</span></div>}
          <div className="flex justify-between items-center pt-1">
            <span className="text-[11px] font-black text-slate-800 uppercase">صافي السند</span>
            <div className="text-xl font-black text-indigo-600">{netTotal.toLocaleString()} <span className="text-[10px] font-bold text-indigo-400">ج.م</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface SalesProps {
  products: Product[];
  invoices: Invoice[];
  onSaveInvoice: (invoice: Invoice) => void;
  onDeductStock: (productId: string, qty: number) => void;
  onGoToView?: (view: ViewType) => void;
  onShowToast?: (message: string, type: 'success' | 'error') => void;
}

const Sales: React.FC<SalesProps> = ({ products, invoices, onSaveInvoice, onDeductStock, onGoToView, onShowToast }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [discountInput, setDiscountInput] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [invoiceNote, setInvoiceNote] = useState('');
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const todayDate = new Date().toLocaleDateString('ar-EG');
  const todayInvoices = useMemo(() => invoices.filter(inv => inv.date === todayDate && !inv.isDeleted), [invoices, todayDate]);
  const isLoyalCustomer = useMemo(() => customerPhone.length >= 11 && invoices.some(inv => inv.customerPhone === customerPhone && !inv.isDeleted), [invoices, customerPhone]);

  const totals = useMemo(() => {
    const subtotal = cart.reduce((acc, item) => acc + item.subtotal, 0);
    const dVal = parseFloat(discountInput) || 0;
    const discountAmount = discountType === 'percentage' ? subtotal * (dVal / 100) : dVal;
    return { subtotal, discountAmount, netTotal: Math.max(0, subtotal - discountAmount), dVal };
  }, [cart, discountInput, discountType]);

  const isPriceInvalid = useMemo(() => cart.some(item => item.unitPrice < item.wholesalePriceAtSale), [cart]);

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.productId === product.id);
    if (product.stock <= (existing ? existing.quantity : 0)) {
      onShowToast?.("الرصيد غير كافٍ في مخزن ميزة", "error");
      return;
    }
    if (existing) {
      setCart(cart.map(item => item.productId === product.id ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.unitPrice } : item));
    } else {
      setCart([...cart, { productId: product.id, name: product.name, quantity: 1, unitPrice: product.retailPrice, wholesalePriceAtSale: product.wholesalePrice, subtotal: product.retailPrice }]);
    }
  };

  useEffect(() => {
    if (!searchTerm.trim()) return;
    const matched = products.find(p => p.code === searchTerm && !p.isDeleted);
    if (matched) { addToCart(matched); onShowToast?.(`تم مسح صنف: ${matched.name}`, "success"); setSearchTerm(''); }
  }, [searchTerm, products]);

  // ميزة الكاميرا والماسح الضوئي
  const toggleScanner = async () => {
    if (isScannerOpen) {
      stopScanner();
    } else {
      setIsScannerOpen(true);
      // تأخير بسيط لضمان وجود عنصر الـ video في الـ DOM قبل تشغيل الكاميرا
      setTimeout(async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
              facingMode: 'environment',
              width: { ideal: 1280 },
              height: { ideal: 720 }
            } 
          });
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
        } catch (err) {
          setIsScannerOpen(false);
          onShowToast?.("تعذر الوصول إلى الكاميرا. يرجى التحقق من الصلاحيات.", "error");
        }
      }, 150);
    }
  };

  const stopScanner = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScannerOpen(false);
  };

  useEffect(() => {
    let animationFrame: number;
    const detectBarcode = async () => {
      if (isScannerOpen && videoRef.current && (window as any).BarcodeDetector) {
        const barcodeDetector = new (window as any).BarcodeDetector({ formats: ['code_128', 'ean_13', 'qr_code'] });
        try {
          const barcodes = await barcodeDetector.detect(videoRef.current);
          if (barcodes.length > 0) {
            const code = barcodes[0].rawValue;
            setSearchTerm(code);
            onShowToast?.("تم التقاط الكود بنجاح", "success");
            stopScanner();
          }
        } catch (e) {
          // Detect logic fail silently to retry
        }
      }
      if (isScannerOpen) {
        animationFrame = requestAnimationFrame(detectBarcode);
      }
    };

    if (isScannerOpen) {
      animationFrame = requestAnimationFrame(detectBarcode);
    }

    return () => cancelAnimationFrame(animationFrame);
  }, [isScannerOpen]);

  const handleDownloadPDF = async (inv: Invoice) => {
    if (!inv) return;
    onShowToast?.("جاري تجهيز ملف PDF...", "success");
    const container = document.createElement('div');
    container.style.position = 'absolute'; container.style.left = '-9999px'; container.style.top = '-9999px';
    container.style.width = '210mm';
    document.body.appendChild(container);
    
    const root = ReactDOM.createRoot(container);
    root.render(<InvoiceTemplate invoice={inv} />);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
        const element = container.firstChild as HTMLElement;
        const canvas = await html2canvas(element, { 
            scale: 2, 
            useCORS: true, 
            backgroundColor: '#ffffff',
            windowWidth: 1200
        });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Meeza_Invoice_${inv.id}.pdf`);
        onShowToast?.("تم تحميل السند بنجاح", "success");
    } catch (err) { 
        onShowToast?.("فشل في توليد ملف PDF", "error"); 
    } finally { 
        root.unmount(); 
        document.body.removeChild(container); 
    }
  };

  const handlePrint = (inv: Invoice) => {
    if (!inv) return;
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed'; iframe.style.right = '1000%'; iframe.style.bottom = '1000%';
    iframe.style.width = '0'; iframe.style.height = '0'; iframe.style.border = 'none';
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow?.document; if (!doc) return;
    const itemsHtml = (inv.items || []).map(item => `<tr><td>${item.name}</td><td style="text-align:center;">${(item.unitPrice || 0).toLocaleString()}</td><td style="text-align:center;">${item.quantity || 0}</td><td style="text-align:left; font-weight:800; color:#4f46e5;">${(item.subtotal || 0).toLocaleString()}</td></tr>`).join('');
    doc.open(); doc.write(`<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;800;900&display=swap" rel="stylesheet"><style>body{font-family:'Cairo',sans-serif;padding:40px;color:#1e293b;background:white;margin:0;}.header{text-align:center;margin-bottom:30px;}.brand{font-size:40px;font-weight:900;color:#4f46e5;margin:0;}.badge{display:inline-block;background:#f1f5f9;color:#4f46e5;padding:4px 12px;border-radius:99px;font-size:11px;font-weight:800;margin-top:8px;}.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;padding:15px 0;border-top:1px solid #f1f5f9;border-bottom:1px solid #f1f5f9;margin-bottom:30px;}.info-row{display:flex;gap:8px;margin-bottom:6px;font-size:13px;}.label{color:#94a3b8;font-weight:800;width:90px;}.val{font-weight:700;color:#334155;}table{width:100%;border-collapse:collapse;margin-bottom:30px;font-size:13px;}th{border-bottom:2px solid #f1f5f9;padding:12px 0;text-align:right;color:#94a3b8;font-weight:800;}.totals-container{display:flex;justify-content:flex-end;}.totals-box{width:250px;background:#f8fafc;padding:20px;border-radius:20px;border:1px solid #f1f5f9;}.total-row{display:flex;justify-content:space-between;margin-bottom:10px;font-size:11px;font-weight:800;color:#64748b;}.net-total{border-top:1px solid #e2e8f0;padding-top:10px;margin-top:10px;font-size:18px;font-weight:900;color:#4f46e5;}</style></head><body><div class="header"><h1 class="brand">ميزة</h1><div class="badge">سند مبيعات رقمي</div></div><div class="info-grid"><div><div class="info-row"><span class="label">رقم الفاتورة:</span><span class="val" style="color:#4f46e5;">#${inv.id}</span></div><div class="info-row"><span class="label">تاريخ السند:</span><span class="val">${inv.date}</span></div></div><div style="text-align:left;"><div class="info-row" style="justify-content:flex-end;"><span class="val">${inv.customerName || 'عميل نقدي'}</span><span class="label">:العميل</span></div></div></div><table><thead><tr><th>الصنف</th><th style="text-align:center;">السعر</th><th style="text-align:center;">الكمية</th><th style="text-align:left;">الإجمالي</th></tr></thead><tbody>${itemsHtml}</tbody></table><div class="totals-container"><div class="totals-box"><div class="total-row"><span>الصافي</span><span>${(inv.netTotal || 0).toLocaleString()} ج.م</span></div></div></div></body></html>`); doc.close();
    iframe.onload = () => { iframe.contentWindow?.focus(); iframe.contentWindow?.print(); setTimeout(() => document.body.removeChild(iframe), 1000); };
  };

  const handleCheckout = () => {
    if (cart.length === 0 || isPriceInvalid) return;
    const now = new Date();
    const invoice: Invoice = { id: `INV-${now.getTime().toString().slice(-6)}`, items: [...cart], totalBeforeDiscount: totals.subtotal, discountValue: totals.dVal, discountType, netTotal: totals.netTotal, date: now.toLocaleDateString('ar-EG'), time: now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }), timestamp: now.getTime(), customerName: customerName || 'عميل نقدي', customerPhone, notes: invoiceNote, status: 'completed', isDeleted: false };
    onSaveInvoice(invoice); cart.forEach(item => onDeductStock(item.productId, item.quantity));
    setCart([]); setDiscountInput(''); setCustomerName(''); setCustomerPhone(''); setInvoiceNote('');
    onShowToast?.("تم إتمام وحفظ عملية البيع بنجاح", "success");
  };

  const shareViaWhatsApp = (inv: Invoice) => {
    if (!inv.customerPhone) { onShowToast?.("يرجى إدخال رقم هاتف للمشاركة", "error"); return; }
    let phone = inv.customerPhone; if (phone.startsWith('0') && phone.length === 11) phone = '2' + phone;
    
    const subtotal = inv.totalBeforeDiscount || 0;
    const discountAmt = subtotal - inv.netTotal;
    const discountPerc = subtotal > 0 ? ((discountAmt / subtotal) * 100).toFixed(0) : 0;

    let itemsText = "\n📦 *الأصناف:* \n";
    inv.items.forEach((item, idx) => {
      itemsText += `${idx + 1}. ${item.name} [x${item.quantity}] - ${item.unitPrice.toLocaleString()} ج.م\n`;
    });

    const msg = `⭐ *فاتورة مبيعات - ميزة POS* ⭐\n\n👤 *العميل:* ${inv.customerName || 'عميل ميزة'}\n📑 *رقم الفاتورة:* #${inv.id}\n📅 *التاريخ:* ${inv.date}\n${itemsText}\n💰 *الإجمالي:* ${subtotal.toLocaleString()} ج.م\n🏷️ *الخصم:* ${discountAmt.toLocaleString()} ج.م (${discountPerc}%)\n\n✅ *الصافي النهائي:* *${inv.netTotal.toLocaleString()} ج.م*`;
    
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in font-['Cairo'] pb-12 w-full max-w-full overflow-x-hidden select-text" dir="rtl">
      {/* Search and Customer Info */}
      <div className="bg-white p-5 md:p-6 lg:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col gap-6 no-print">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase mr-1">اسم العميل (اختياري)</label>
              <div className="relative">
                <User className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type="text" className="w-full pr-11 pl-4 py-3 bg-slate-50 rounded-xl outline-none font-bold text-sm border border-transparent focus:border-indigo-500/20" value={customerName} onChange={e => setCustomerName(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-slate-400 uppercase">رقم الهاتف (CRM)</label>
                {isLoyalCustomer && <span className="bg-indigo-600 text-white px-2.5 py-1 rounded-lg text-[9px] font-black flex items-center gap-1 shadow-md"><UserCheck size={10} /> عميل دائم</span>}
              </div>
              <div className="relative">
                <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type="tel" className="w-full pr-11 pl-4 py-3 bg-slate-50 rounded-xl outline-none font-bold text-sm border border-transparent focus:border-indigo-500/20" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} />
              </div>
            </div>
         </div>
         <div className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="ابحث عن صنف أو امسح الباركود..." 
                className="w-full pr-11 pl-12 py-4 md:py-5 bg-white rounded-xl outline-none font-black text-sm md:text-base border border-slate-200 focus:ring-4 focus:ring-indigo-500/5 transition-all" 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
              />
              <button 
                onClick={toggleScanner}
                className={`absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all ${isScannerOpen ? 'bg-rose-100 text-rose-600' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
                title="فتح الكاميرا لمسح الباركود"
              >
                <Camera size={20} />
              </button>
            </div>
            {searchTerm && products.some(p => !p.isDeleted && p.name.toLowerCase().includes(searchTerm.toLowerCase())) && (
               <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-[1.5rem] shadow-2xl z-50 max-h-80 overflow-y-auto divide-y divide-slate-50">
                  {products.filter(p => !p.isDeleted && p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
                     <button key={p.id} onClick={() => { addToCart(p); setSearchTerm(''); }} className="w-full p-4 hover:bg-indigo-50 flex justify-between items-center text-right font-bold transition-colors group">
                        <div className="flex-1 min-w-0 px-2"><p className="text-sm group-hover:text-indigo-600 truncate">{p.name}</p><p className="text-[10px] text-slate-400 font-black">مخزون: {p.stock} قطعة</p></div>
                        <span className="text-indigo-600 font-black text-xs shrink-0">{p.retailPrice.toLocaleString()} ج.م</span>
                     </button>
                  ))}
               </div>
            )}
         </div>
      </div>

      {/* نافذة الكاميرا - تم إصلاح منطق العرض والتنسيق */}
      {isScannerOpen && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[2000] flex flex-col items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-lg overflow-hidden relative shadow-2xl border-4 border-indigo-600">
            <div className="bg-indigo-600 p-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Camera size={20} />
                <h3 className="font-black text-sm">ماسح باركود ميزة</h3>
              </div>
              <button onClick={stopScanner} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>
            {/* حاوية الفيديو بأبعاد ثابتة وتنسيق يضمن التمدد */}
            <div id="camera-preview-container" className="relative w-full h-64 md:h-80 bg-black overflow-hidden flex items-center justify-center">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted
                className="absolute inset-0 w-full h-full object-cover grayscale brightness-110"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <div className="w-64 h-32 border-2 border-indigo-400/50 rounded-lg relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-indigo-500 shadow-[0_0_15px_#6366f1] animate-[scan_2s_linear_infinite]" />
                </div>
              </div>
              <p className="absolute bottom-4 left-0 right-0 text-center text-white/70 text-[10px] font-bold z-10">ضع الباركود داخل الإطار للمسح</p>
            </div>
            <div className="p-4 bg-slate-50 flex justify-center">
              <button 
                onClick={stopScanner}
                className="px-10 py-3 bg-rose-600 text-white font-black rounded-xl text-[10px] hover:bg-rose-700 transition-all shadow-lg"
              >
                إغلاق الكاميرا
              </button>
            </div>
          </div>
          <style>{`
            @keyframes scan {
              0% { top: 0; }
              50% { top: 100%; }
              100% { top: 0; }
            }
          `}</style>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 no-print">
        <div className="md:col-span-7 lg:col-span-8 space-y-6">
          <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden min-h-[300px]">
            <div className="p-5 md:p-6 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
               <h3 className="text-xs md:text-sm font-black text-slate-800 flex items-center gap-3"><ShoppingCart size={18} className="text-indigo-600" /> سلة مبيعات ميزة</h3>
               {cart.length > 0 && <span className="text-[10px] md:text-xs font-black text-slate-400">{cart.length} أصناف</span>}
            </div>
            {cart.length === 0 ? (
               <div className="p-16 md:p-24 text-center text-slate-300 flex flex-col items-center gap-4">
                  <ShoppingCart size={48} className="opacity-10" />
                  <p className="font-bold italic text-sm md:text-base">أضف منتجات للفاتورة للبدء</p>
               </div>
            ) : (
              <div className="overflow-x-auto">
                 <table className="w-full text-right text-sm min-w-[500px]">
                  <thead className="bg-slate-50 text-slate-400 font-black uppercase text-[9px] border-b">
                     <tr><th className="px-6 py-4">الصنف</th><th className="px-6 py-4 text-center">البيع</th><th className="px-6 py-4 text-center">الكمية</th><th className="px-6 py-4 text-left">الإجمالي</th><th className="px-6 py-4"></th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {cart.map(item => (
                        <tr key={item.productId} className={`hover:bg-slate-50/50 ${item.unitPrice < item.wholesalePriceAtSale ? 'bg-rose-50/50' : ''}`}>
                           <td className="px-6 py-5">
                              <p className="font-bold text-slate-800 text-sm">{item.name}</p>
                              <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">التكلفة: {item.wholesalePriceAtSale} ج.م</p>
                           </td>
                           <td className="px-6 py-5">
                              <input type="number" value={item.unitPrice} onChange={(e) => setCart(prev => prev.map(i => i.productId === item.productId ? {...i, unitPrice: Number(e.target.value), subtotal: i.quantity * Number(e.target.value)} : i))} className={`w-20 px-2 py-1.5 bg-white border rounded-xl text-center font-black text-[12px] ${item.unitPrice < item.wholesalePriceAtSale ? 'border-rose-500 text-rose-600' : 'border-slate-200'}`} />
                           </td>
                           <td className="px-6 py-5">
                              <div className="flex items-center justify-center gap-3">
                                 <button onClick={() => {if(item.quantity>1) setCart(prev => prev.map(i => i.productId === item.productId ? {...i, quantity: i.quantity-1, subtotal: (i.quantity-1)*i.unitPrice} : i))}} className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center hover:bg-slate-200 transition-all shadow-sm"><Minus size={14}/></button>
                                 <span className="font-black text-sm min-w-[20px] text-center">{item.quantity}</span>
                                 <button onClick={() => {if(item.quantity < (products.find(p=>p.id===item.productId)?.stock || 0)) setCart(prev => prev.map(i => i.productId === item.productId ? {...i, quantity: i.quantity+1, subtotal: (i.quantity+1)*i.unitPrice} : i))}} className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center hover:bg-slate-200 transition-all shadow-sm"><Plus size={14}/></button>
                              </div>
                           </td>
                           <td className="px-6 py-5 text-left font-black text-slate-800 text-sm">{item.subtotal.toLocaleString()}</td>
                           <td className="px-6 py-5 text-left"><button onClick={() => setCart(cart.filter(i => i.productId !== item.productId))} className="text-slate-300 hover:text-rose-500 p-2 transition-colors"><Trash2 size={18}/></button></td>
                        </tr>
                     ))}
                  </tbody>
                 </table>
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-5 lg:col-span-4">
          <div className="bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-200 shadow-xl space-y-6 md:sticky md:top-24 overflow-hidden">
            <h3 className="text-xs md:text-sm font-black text-slate-800 mb-2 flex items-center gap-3"><Tag size={18} className="text-indigo-600" /> ملخص العملية</h3>
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
               <label className="text-[10px] font-black text-slate-400 uppercase">تطبيق خصم ميزة</label>
               <div className="flex gap-3">
                  <input type="text" value={discountInput} onChange={e => setDiscountInput(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-center font-black text-sm" placeholder="0" />
                  <select value={discountType} onChange={e => setDiscountType(e.target.value as any)} className="bg-white border border-slate-200 rounded-xl text-[11px] font-black px-4 outline-none focus:ring-2 focus:ring-indigo-500/20"><option value="percentage">٪</option><option value="fixed">ج.م</option></select>
               </div>
            </div>
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2"><FileText size={14} className="text-slate-400" /> ملاحظات إدارية</label>
              <textarea className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none font-bold text-[12px] min-h-[80px] resize-none focus:border-indigo-500/30 transition-all" placeholder="اكتب ملاحظات الفاتورة..." value={invoiceNote} onChange={e => setInvoiceNote(e.target.value)} />
            </div>
            <div className="bg-indigo-600 p-6 rounded-[2rem] shadow-lg text-center transform transition-transform hover:scale-[1.02]">
               <p className="text-[10px] text-white/70 font-black mb-1.5 uppercase tracking-widest">المبلغ النهائي للدفع</p>
               <p className="text-3xl md:text-4xl font-black text-white">{totals.netTotal.toLocaleString()} <span className="text-sm font-bold">ج.م</span></p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => { if (cart.length > 0) setPreviewInvoice({ id: 'PREVIEW', items: [...cart], totalBeforeDiscount: totals.subtotal, discountValue: totals.dVal, discountType, netTotal: totals.netTotal, date: todayDate, time: new Date().toLocaleTimeString('ar-EG'), timestamp: Date.now(), customerName, customerPhone, status: 'completed', notes: invoiceNote }); }} disabled={cart.length === 0} className="py-2.5 bg-slate-100 text-slate-600 font-black rounded-xl text-[10px] disabled:opacity-50 transition-all hover:bg-slate-200 active:scale-95">معاينة</button>
              <button onClick={handleCheckout} disabled={cart.length === 0 || isPriceInvalid} className={`py-2.5 text-white font-black rounded-xl shadow-xl text-[10px] flex items-center justify-center gap-3 ${isPriceInvalid ? 'bg-slate-300' : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all'}`}><Save size={16} /> إتمام البيع</button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden no-print">
        <div className="p-6 md:p-10 border-b bg-slate-50/20 flex items-center gap-4"><div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl shadow-sm"><History size={24}/></div><h3 className="text-sm md:text-lg font-black text-slate-800">نشاط مبيعات اليوم</h3></div>
        <div className="overflow-x-auto"><table className="w-full text-right text-[11px] min-w-[1000px]"><thead className="bg-slate-50 text-slate-400 font-black uppercase text-[9px] border-b"><tr><th className="px-8 py-5">رقم السند</th><th className="px-8 py-5">توقيت</th><th className="px-8 py-5">العميل</th><th className="px-8 py-5 text-center">الإجمالي</th><th className="px-8 py-5 text-center">الخصم (%)</th><th className="px-8 py-5 text-center">الصافي</th><th className="px-8 py-5 text-left">الإجراءات</th></tr></thead>
            <tbody className="divide-y divide-slate-50 font-bold">{todayInvoices.length > 0 ? todayInvoices.slice(0, 10).map(inv => {
                  const discountAmt = inv.totalBeforeDiscount - inv.netTotal;
                  const discountPerc = inv.totalBeforeDiscount > 0 ? ((discountAmt / inv.totalBeforeDiscount) * 100).toFixed(0) : 0;
                  return (
                  <tr key={inv.id} className="hover:bg-slate-50/50 transition-all">
                    <td className="px-8 py-5 text-indigo-600 font-black select-all">
                      <button onClick={() => {navigator.clipboard.writeText(inv.id); setCopiedId(inv.id); setTimeout(()=>setCopiedId(null),2000)}} className="flex items-center gap-2 hover:bg-indigo-50 px-2 py-1 rounded transition-colors group">
                        #{inv.id}
                        {copiedId === inv.id ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} className="opacity-0 group-hover:opacity-30 transition-opacity" />}
                      </button>
                    </td>
                    <td className="px-8 py-4 text-slate-400">{inv.time}</td>
                    <td className="px-8 py-4 text-slate-700 truncate max-w-[150px]">{inv.customerName || 'نقدي'}</td>
                    <td className="px-8 py-4 text-center text-slate-400">{inv.totalBeforeDiscount.toLocaleString()} ج.م</td>
                    <td className="px-8 py-4 text-center text-rose-500">
                      {discountAmt.toLocaleString()} ج.م
                      <span className="text-[9px] font-black block opacity-60">({discountPerc}%)</span>
                    </td>
                    <td className="px-8 py-4 text-center font-black text-slate-900">{inv.netTotal.toLocaleString()} ج.م</td>
                    <td className="px-8 py-4 text-left"><div className="flex gap-2 justify-end"><button onClick={() => setPreviewInvoice({...inv})} className="p-2.5 bg-slate-100 text-slate-400 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"><Eye size={16}/></button><button onClick={() => handleDownloadPDF(inv)} className="p-2.5 bg-slate-100 text-slate-400 rounded-xl hover:bg-indigo-700 hover:text-white transition-all shadow-sm"><DownloadCloud size={16}/></button><button onClick={() => shareViaWhatsApp(inv)} className="p-2.5 bg-slate-100 text-slate-400 rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-sm"><MessageCircle size={16}/></button></div></td></tr>
              )}) : (<tr><td colSpan={7} className="p-24 text-center text-slate-300 italic font-black text-sm uppercase tracking-widest">لا توجد مبيعات نشطة حالياً</td></tr>)}
            </tbody></table></div>
      </div>

      {previewInvoice && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[1000] flex items-center justify-center p-3 md:p-8 animate-in transition-all">
          <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] w-full max-w-[900px] max-h-[90vh] shadow-2xl overflow-hidden flex flex-col relative">
             <div className="p-5 md:p-6 border-b bg-slate-50 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-4"><div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg"><Eye size={20}/></div><div><h3 className="font-black text-sm md:text-base text-slate-800">معاينة العملية</h3><p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5 select-all">#{previewInvoice.id}</p></div></div>
                <button onClick={() => setPreviewInvoice(null)} className="p-2 hover:bg-rose-50 hover:text-rose-600 text-slate-400 rounded-xl transition-all"><X size={24}/></button>
             </div>
             <div className="flex-1 overflow-y-auto bg-slate-100/50 p-4 md:p-12 scrollbar-hide">
                <div className="max-w-[210mm] mx-auto scale-[0.7] sm:scale-[0.85] md:scale-100 origin-top shadow-2xl">
                  <InvoiceTemplate invoice={previewInvoice} />
                </div>
             </div>
             <div className="p-6 md:p-8 bg-white border-t border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between no-print shrink-0">
                <div className="flex items-center gap-4 w-full md:w-auto">
                   <button onClick={() => handleDownloadPDF(previewInvoice)} className="flex-1 md:flex-none px-12 py-3 bg-indigo-600 text-white font-black rounded-xl shadow-xl text-[10px] flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all active:scale-95"><DownloadCloud size={18} /> تحميل PDF</button>
                   <button onClick={() => handlePrint(previewInvoice)} className="flex-1 md:flex-none px-12 py-3 bg-slate-800 text-white font-black rounded-xl shadow-xl text-[10px] flex items-center justify-center gap-3 hover:bg-black transition-all active:scale-95"><Printer size={18} /> طباعة</button>
                </div>
                <button onClick={() => setPreviewInvoice(null)} className="w-full md:w-auto px-10 py-3 bg-slate-100 text-slate-500 font-black rounded-xl text-[10px] hover:bg-slate-200 transition-all">إغلاق</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;
