
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Plus, Search, Eye, X, Package, Boxes, Edit3, Copy, Check, FileSpreadsheet, 
  AlertTriangle, Briefcase, Layers, ShoppingBag, TrendingDown, RefreshCw, Trash2,
  Barcode, Printer
} from 'lucide-react';
import { Product } from '../types';

declare const XLSX: any;
declare const JsBarcode: any;

const BarcodeGeneratorModal: React.FC<{ product: Product; onClose: () => void }> = ({ product, onClose }) => {
  const barcodeRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (barcodeRef.current) {
      JsBarcode(barcodeRef.current, product.code, {
        format: "CODE128",
        lineColor: "#000",
        width: 2,
        height: 80,
        displayValue: true,
        font: "Cairo",
        fontSize: 14,
        textMargin: 4
      });
    }
  }, [product]);

  const handlePrintBarcode = () => {
    const printArea = document.getElementById('barcode-print-area');
    if (!printArea) return;

    printArea.innerHTML = `
      <div class="barcode-sticker-mode" style="font-family: 'Cairo', sans-serif; text-align: center;">
        <div style="font-weight: 900; font-size: 12px; margin-bottom: 2px;">ميزة POS</div>
        <div style="font-weight: 700; font-size: 10px; margin-bottom: 2px; white-space: nowrap; overflow: hidden;">${product.name}</div>
        <svg id="print-barcode-svg"></svg>
        <div style="font-weight: 900; font-size: 12px; margin-top: 2px;">${product.retailPrice} ج.م</div>
      </div>
    `;

    JsBarcode("#print-barcode-svg", product.code, {
      format: "CODE128",
      width: 1.5,
      height: 40,
      displayValue: true,
      fontSize: 10
    });

    setTimeout(() => {
      window.print();
      printArea.innerHTML = '';
    }, 300);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[500] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-sm shadow-2xl overflow-hidden animate-in">
        <div className="p-6 border-b bg-indigo-600 text-white flex justify-between items-center shrink-0">
          <h3 className="font-black text-sm flex items-center gap-3"><Barcode size={20} /> باركود ميزة</h3>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors"><X size={20}/></button>
        </div>
        <div className="p-8 flex flex-col items-center bg-slate-50">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center w-full overflow-hidden">
            <p className="text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest truncate w-full text-center">{product.name}</p>
            <svg ref={barcodeRef} className="max-w-full"></svg>
            <p className="text-lg font-black text-indigo-600 mt-4">{product.retailPrice} ج.م</p>
          </div>
        </div>
        <div className="p-6 bg-white flex flex-col gap-3 shrink-0">
          <button 
            onClick={handlePrintBarcode}
            className="w-full py-3 bg-slate-900 text-white font-black rounded-xl shadow-xl flex items-center justify-center gap-3 hover:bg-black transition-all text-[11px]"
          >
            <Printer size={18} /> طباعة الملصق
          </button>
          <button onClick={onClose} className="w-full py-2 bg-slate-100 text-slate-500 font-black rounded-xl text-[9px]">إغلاق</button>
        </div>
      </div>
    </div>
  );
};

export const ProductDetailsModal: React.FC<{ product: Product; onClose: () => void }> = ({ product, onClose }) => {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[300] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] w-full max-w-sm shadow-2xl overflow-hidden animate-in">
        <div className="p-5 border-b border-slate-50 flex justify-between items-start bg-indigo-600 text-white shrink-0">
          <div className="space-y-1 min-w-0 text-right">
            <h3 className="text-base font-black truncate">{product.name}</h3>
            <p className="text-[10px] opacity-80 font-bold select-all">كود: {product.code}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors shrink-0"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-right">
             <p className="text-[10px] font-black text-slate-400 uppercase mb-1">تفاصيل الصنف</p>
             <p className="text-xs font-bold text-slate-600 leading-relaxed whitespace-pre-wrap">
               {product.description || "لا توجد تفاصيل إضافية مسجلة لهذا الصنف."}
             </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">سعر الجملة</p>
                <p className="text-lg font-black truncate">{product.wholesalePrice} ج.م</p>
             </div>
             <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 text-right">
                <p className="text-[10px] font-black text-indigo-400 uppercase mb-1">سعر البيع</p>
                <p className="text-lg font-black text-indigo-600 truncate">{product.retailPrice} ج.م</p>
             </div>
          </div>
          <div className="flex justify-between items-center p-4 bg-slate-800 rounded-2xl text-white">
             <span className="text-xs font-bold shrink-0">الرصيد المتاح:</span>
             <span className="text-xl font-black truncate">{product.stock} قطعة</span>
          </div>
        </div>
        <div className="p-4 bg-slate-50 border-t border-slate-100 shrink-0">
           <button onClick={onClose} className="w-full py-2.5 bg-white border border-slate-200 text-slate-600 font-black rounded-xl hover:bg-slate-100 transition-all text-[10px]">إغلاق</button>
        </div>
      </div>
    </div>
  );
};

interface InventoryProps {
  products: Product[];
  onAddProduct: (name: string, description: string, wholesale: number, retail: number, initialStock: number) => void;
  onUpdateStock: (id: string, qty: number, price: number, retail?: number, description?: string) => void;
  onUpdateProduct: (id: string, updates: Partial<Product>) => void;
  onDeleteProduct: (id: string, reason: string) => void;
  onProductClick?: (product: Product) => void;
  onShowToast?: (message: string, type: 'success' | 'error') => void;
}

const Inventory: React.FC<InventoryProps> = ({ products, onAddProduct, onUpdateStock, onUpdateProduct, onDeleteProduct, onProductClick, onShowToast }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{id: string, reason: string} | null>(null);
  const [barcodeProduct, setBarcodeProduct] = useState<Product | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formWholesale, setFormWholesale] = useState(0);
  const [formRetail, setFormRetail] = useState(0);
  const [formStock, setFormStock] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const activeProducts = useMemo(() => products.filter(p => !p.isDeleted), [products]);
  
  // البحث الحي للأصناف المشابهة
  const similarProducts = useMemo(() => {
    const trimmed = formName.trim().toLowerCase();
    if (trimmed.length < 1) return [];
    return activeProducts.filter(p => p.name.toLowerCase().includes(trimmed)).slice(0, 5);
  }, [formName, activeProducts]);

  const filtered = activeProducts.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.code.includes(searchTerm)
  );

  const analytics = useMemo(() => {
    const totalValue = activeProducts.reduce((acc, p) => acc + (p.stock * p.wholesalePrice), 0);
    const outOfStock = activeProducts.filter(p => p.stock === 0).length;
    const lowStock = activeProducts.filter(p => p.stock > 0 && p.stock < 5).length;
    return { totalValue, count: activeProducts.length, totalPieces: activeProducts.reduce((a,p) => a + p.stock, 0), outOfStock, lowStock };
  }, [activeProducts]);

  const handleExportExcel = () => {
    const data = activeProducts.map(p => ({
      "الكود": p.code, 
      "اسم المنتج": p.name, 
      "الرصيد": p.stock, 
      "تكلفة الوحدة": p.wholesalePrice, 
      "سعر البيع": p.retailPrice, 
      "إجمالي التكلفة (جملة)": p.stock * p.wholesalePrice,
      "إجمالي القيمة (قطاعي)": p.stock * p.retailPrice
    }));

    const totalPieces = activeProducts.reduce((sum, p) => sum + p.stock, 0);
    const totalWholesaleValue = activeProducts.reduce((sum, p) => sum + (p.stock * p.wholesalePrice), 0);
    const totalRetailValue = activeProducts.reduce((sum, p) => sum + (p.stock * p.retailPrice), 0);
    
    data.push({
      "الكود": "الإجمالي العام",
      "اسم المنتج": `عدد الأصناف: ${activeProducts.length}`,
      "الرصيد": totalPieces,
      "تكلفة الوحدة": 0,
      "سعر البيع": 0,
      "إجمالي التكلفة (جملة)": totalWholesaleValue,
      "إجمالي القيمة (قطاعي)": totalRetailValue
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "مخزن ميزة POS");
    XLSX.writeFile(workbook, `Meeza_Inventory_${new Date().toLocaleDateString('ar-EG').replace(/\//g, '-')}.xlsx`);
  };

  const handleAddSubmit = () => {
    if (!formName.trim() || formRetail <= 0) return;
    const match = activeProducts.find(p => p.name.toLowerCase() === formName.trim().toLowerCase());
    
    if (match) {
      // استخدام نظام الوسط الحسابي المرجح (WAC) لتحديث المخزون الموجود مسبقاً وحفظ التفاصيل الجديدة
      onUpdateStock(match.id, formStock, formWholesale, formRetail, formDescription);
      onShowToast?.(`تم تحديث بيانات ${formName} بنظام الوسط الحسابي`, "success");
    } else {
      onAddProduct(formName, formDescription, formWholesale, formRetail, formStock);
      onShowToast?.(`تمت إضافة ${formName} كصنف جديد`, "success");
    }
    setIsAddOpen(false); resetForm();
  };

  const resetForm = () => {
    setFormName(''); setFormDescription(''); setFormWholesale(0); setFormRetail(0); setFormStock(0); setShowSuggestions(false);
  };

  const selectSuggestion = (p: Product) => {
    setFormName(p.name);
    setFormWholesale(p.wholesalePrice);
    setFormRetail(p.retailPrice);
    setFormDescription(p.description || '');
    setShowSuggestions(false);
  };

  const executeDelete = () => {
    if (confirmDelete && confirmDelete.reason.trim()) {
      onDeleteProduct(confirmDelete.id, confirmDelete.reason);
      onShowToast?.("تم نقل الصنف لسلة المحذوفات", "success");
      setConfirmDelete(null);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in font-['Cairo'] pb-12 select-text" dir="rtl">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
         <div className="bg-indigo-600 p-6 rounded-[2rem] text-white shadow-xl relative overflow-hidden group">
            <div className="relative z-10 text-right"><p className="text-[9px] font-black opacity-60 uppercase mb-1">قيمة المخزن</p><h3 className="text-xl md:text-2xl font-black">{analytics.totalValue.toLocaleString()} ج.م</h3></div>
            <Briefcase size={60} className="absolute -bottom-2 -left-2 text-white/10 group-hover:scale-110 transition-transform" />
         </div>
         <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="relative z-10 text-right"><p className="text-[9px] font-black text-slate-400 uppercase mb-1">الأصناف</p><h3 className="text-xl md:text-2xl font-black text-slate-800">{analytics.count} صنف</h3></div>
            <Layers size={60} className="absolute -bottom-2 -left-2 text-slate-50 group-hover:scale-110 transition-transform" />
         </div>
         <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="relative z-10 text-right"><p className="text-[9px] font-black text-slate-400 uppercase mb-1">القطع الكلي</p><h3 className="text-xl md:text-2xl font-black text-slate-800">{analytics.totalPieces} قطعة</h3></div>
            <ShoppingBag size={60} className="absolute -bottom-2 -left-2 text-slate-50 group-hover:scale-110 transition-transform" />
         </div>
         <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="relative z-10 text-right"><p className="text-[9px] font-black text-slate-400 uppercase mb-1">نافذة</p><h3 className="text-xl md:text-2xl font-black text-rose-600">{analytics.outOfStock} صنف</h3></div>
            <TrendingDown size={60} className="absolute -bottom-2 -left-2 text-rose-50 group-hover:scale-110 transition-transform" />
         </div>
         <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="relative z-10 text-right"><p className="text-[9px] font-black text-slate-400 uppercase mb-1">أوشكت</p><h3 className="text-xl md:text-2xl font-black text-amber-600">{analytics.lowStock} صنف</h3></div>
            <AlertTriangle size={60} className="absolute -bottom-2 -left-2 text-amber-50 group-hover:scale-110 transition-transform" />
         </div>
      </div>

      <div className="bg-white p-4 md:p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between no-print h-auto md:h-24">
         <div className="flex-1 relative">
            <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="ابحث في مخزن ميزة..." className="w-full pr-14 pl-4 py-3 bg-slate-50 rounded-xl outline-none font-bold text-sm" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
         </div>
         <div className="flex items-center gap-3">
            <button onClick={handleExportExcel} className="flex-1 md:flex-none px-6 py-3 bg-emerald-100 text-emerald-700 font-black rounded-xl text-xs flex items-center justify-center gap-2 border border-emerald-200 transition-all active:scale-95"><FileSpreadsheet size={16} />تصدير</button>
            <button onClick={() => { resetForm(); setIsAddOpen(true); }} className="flex-1 md:flex-none px-8 py-3 bg-indigo-600 text-white font-black rounded-xl shadow-lg text-xs flex items-center justify-center gap-2 shrink-0 transition-all active:scale-95"><Plus size={16} />صنف جديد</button>
         </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs min-w-[800px]">
            <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-black tracking-widest border-b">
              <tr><th className="px-8 py-6">كود الصنف</th><th className="px-8 py-6">المنتج</th><th className="px-8 py-6 text-center">المخزون</th><th className="px-8 py-6">الجملة</th><th className="px-8 py-6">البيع</th><th className="px-8 py-6 text-left">الإجراءات</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-bold">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-indigo-50/20 transition-colors group">
                  <td className="px-8 py-5 min-w-[140px]">
                    <button onClick={() => {navigator.clipboard.writeText(p.code); setCopiedCode(p.code); setTimeout(()=>setCopiedCode(null),2000)}} className="flex items-center gap-2 font-mono font-black px-3 py-1.5 rounded-lg border text-[10px] transition-all select-all bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-600 hover:text-white">
                      {p.code}{copiedCode === p.code ? <Check size={12} className="text-emerald-300" /> : <Copy size={12} className="opacity-30" />}
                    </button>
                  </td>
                  <td className="px-8 py-5 font-black text-slate-800 text-sm truncate max-w-[250px]">{p.name}</td>
                  <td className="px-8 py-5 text-center min-w-[150px]">
                    <span className={`inline-flex px-4 py-1.5 rounded-full text-[10px] font-black border min-w-[100px] justify-center ${p.stock === 0 ? 'bg-rose-50 text-rose-600 border-rose-100' : p.stock < 5 ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                      {p.stock} قطعة
                    </span>
                  </td>
                  <td className="px-8 py-5 text-slate-400 text-sm truncate">{p.wholesalePrice.toLocaleString()} ج.م</td>
                  <td className="px-8 py-5 font-black text-indigo-600 text-sm truncate">{p.retailPrice.toLocaleString()} ج.م</td>
                  <td className="px-8 py-5 text-left">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setBarcodeProduct(p)} className="p-2.5 text-slate-400 hover:text-indigo-600 transition-colors bg-slate-50 rounded-xl" title="باركود"><Barcode size={18} /></button>
                      <button onClick={() => onProductClick?.(p)} className="p-2.5 text-slate-400 hover:text-indigo-600 transition-colors bg-slate-50 rounded-xl"><Eye size={18} /></button>
                      <button onClick={() => setConfirmDelete({id: p.id, reason: ''})} className="p-2.5 text-slate-300 hover:text-rose-500 transition-colors bg-slate-50 rounded-xl"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isAddOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[600] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in">
             <div className="p-6 bg-indigo-600 text-white flex justify-between items-center">
                <h3 className="font-black text-sm">إضافة صنف جديد لميزة</h3>
                <button onClick={() => setIsAddOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all"><X size={20}/></button>
             </div>
             <div className="p-8 space-y-4 max-h-[70vh] overflow-y-auto scrollbar-hide">
                <div className="space-y-1 relative">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">اسم المنتج</label>
                   <input 
                    type="text" 
                    value={formName} 
                    onChange={e => { setFormName(e.target.value); setShowSuggestions(true); }} 
                    onFocus={() => setShowSuggestions(true)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-xs" 
                    placeholder="ابدأ بكتابة اسم المنتج..." 
                   />
                   
                   {/* قائمة الأصناف المشابهة (البحث الحي) مع إمكانية الاختيار */}
                   {showSuggestions && similarProducts.length > 0 && (
                     <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl z-[700] p-2 space-y-1 animate-in">
                        <p className="text-[8px] font-black text-slate-400 px-2 pb-1 border-b border-slate-50 mb-1">صنف مسجل بالفعل (اختر للتحديث):</p>
                        {similarProducts.map(p => (
                          <button key={p.id} onClick={() => selectSuggestion(p)} className="w-full text-right p-3 hover:bg-indigo-50 rounded-lg flex justify-between items-center group transition-colors border border-transparent hover:border-indigo-100">
                            <div className="flex flex-col gap-0.5">
                                <span className="text-[11px] font-black text-slate-700 group-hover:text-indigo-600 leading-tight">{p.name}</span>
                                <div className="flex gap-2 items-center">
                                  <div className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-black text-[8px]">كود: #{p.code}</div>
                                  <div className="flex items-center gap-1 bg-indigo-50 px-1.5 py-0.5 rounded text-indigo-600 font-black text-[8px]">المخزون: {p.stock} قطعة</div>
                                </div>
                            </div>
                            <div className="text-left shrink-0">
                                <span className="text-[10px] font-black text-indigo-600">{p.retailPrice} ج.م</span>
                                <p className="text-[7px] text-slate-300 font-black">اضغط للاختيار</p>
                            </div>
                          </button>
                        ))}
                     </div>
                   )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">سعر التكلفة (جديد)</label>
                    <input type="number" value={formWholesale || ''} onChange={e => setFormWholesale(Number(e.target.value))} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none font-black text-xs" placeholder="0.00" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">سعر البيع (المقترح)</label>
                    <input type="number" value={formRetail || ''} onChange={e => setFormRetail(Number(e.target.value))} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none font-black text-xs" placeholder="0.00" />
                  </div>
                </div>
                <div className="space-y-1">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">الكمية المضافة</label>
                   <input type="number" value={formStock || ''} onChange={e => setFormStock(Number(e.target.value))} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none font-black text-xs" placeholder="أدخل الكمية..." />
                </div>
                <div className="space-y-1">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">تفاصيل الصنف</label>
                   <textarea value={formDescription} onChange={e => setFormDescription(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-[10px] min-h-[60px]" placeholder="التفاصيل التي ستظهر في نافذة المعاينة..." />
                </div>
             </div>
             <div className="p-6 bg-slate-50 border-t flex gap-3">
                <button onClick={() => setIsAddOpen(false)} className="flex-1 py-3 bg-white border border-slate-200 text-slate-500 font-black rounded-xl text-[9px]">إلغاء</button>
                <button onClick={handleAddSubmit} className="flex-[2] py-3 bg-indigo-600 text-white font-black rounded-xl shadow-xl text-[9px] hover:bg-indigo-700 transition-all">حفظ وتحديث المخزن</button>
             </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[700] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-sm shadow-2xl overflow-hidden animate-in">
            <div className="p-8 text-center bg-rose-50">
              <AlertTriangle className="mx-auto mb-4 text-rose-600" size={40}/>
              <h3 className="text-xl font-black mb-2 text-slate-800">حذف الصنف؟</h3>
              <p className="text-slate-500 text-[10px] font-bold leading-relaxed mb-4">سيتم نقل الصنف لسلة المحذوفات. يرجى ذكر السبب:</p>
              <textarea autoFocus value={confirmDelete.reason} onChange={e => setConfirmDelete({...confirmDelete, reason: e.target.value})} className="w-full p-3 rounded-xl border border-rose-200 outline-none font-bold text-xs min-h-[80px]" placeholder="مثال: تلف المنتج، خطأ إدخال..." />
            </div>
            <div className="p-5 bg-white border-t flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 bg-slate-100 rounded-xl font-black text-[10px]">تراجع</button>
              <button onClick={executeDelete} disabled={!confirmDelete.reason.trim()} className="flex-[1.5] py-2.5 bg-rose-600 text-white rounded-xl font-black text-[10px] disabled:opacity-50 active:scale-95 transition-all">تأكيد الحذف</button>
            </div>
          </div>
        </div>
      )}

      {barcodeProduct && <BarcodeGeneratorModal product={barcodeProduct} onClose={() => setBarcodeProduct(null)} />}
    </div>
  );
};

export default Inventory;
