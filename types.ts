
export interface Product {
  id: string;
  code: string;
  name: string;
  description?: string;
  wholesalePrice: number;
  retailPrice: number;
  stock: number;
  isDeleted?: boolean;
  deletionReason?: string;
  deletionTimestamp?: number;
}

export interface SaleItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  wholesalePriceAtSale: number;
  subtotal: number;
}

export interface Invoice {
  id: string;
  items: SaleItem[];
  totalBeforeDiscount: number;
  discountValue: number;
  discountType: 'percentage' | 'fixed';
  netTotal: number;
  date: string;
  time: string;
  timestamp: number;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
  status: 'completed' | 'returned';
  isDeleted?: boolean;
  deletionReason?: string;
  deletionTimestamp?: number;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  time: string;
  timestamp: number;
}

export interface ReturnItem {
  productId: string;
  name: string;
  quantity: number;
  refundAmount: number;
  wholesalePriceAtSale: number;
}

export interface ReturnRecord {
  id: string;
  invoiceId: string;
  items: ReturnItem[];
  totalRefund: number;
  date: string;
  time: string;
  timestamp: number;
  isDeleted?: boolean;
  deletionReason?: string;
  deletionTimestamp?: number;
}

export type ViewType = 'dashboard' | 'sales' | 'inventory' | 'returns' | 'expenses' | 'reports' | 'archive' | 'recycleBin' | 'customers';
