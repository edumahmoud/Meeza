
import React, { useState, useEffect } from 'react';
import { ViewType, Product, Invoice, Expense, ReturnRecord } from './types';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Sales from './components/Sales';
import Inventory, { ProductDetailsModal } from './components/Inventory';
import Returns from './components/Returns';
import Expenses from './components/Expenses';
import Reports from './components/Reports';
import Archive from './components/Archive';
import RecycleBin from './components/RecycleBin';
import Customers from './components/Customers';
import { useInventory } from './hooks/useInventory';
import { useSalesData } from './hooks/useSalesData';

const App: React.FC = () => {
  const [currentView, setView] = useState<ViewType>('dashboard');
  const [selectedDetailProduct, setSelectedDetailProduct] = useState<Product | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  const inventory = useInventory();
  const salesData = useSalesData();

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleRestore = (data: any) => {
    salesData.restoreAllData(data);
    if (data.products) {
      inventory.restoreProducts(data.products);
    }
    showToast("تمت استعادة البيانات بنجاح");
  };

  const handleShowProductDetails = (product: Product) => {
    setSelectedDetailProduct(product);
  };

  // Advanced Recycle Bin Handlers
  const handleRestoreInvoice = (id: string, restoreStock: boolean) => {
    const inv = salesData.invoices.find(i => i.id === id);
    if (inv && restoreStock) {
      const itemsToDeduct = inv.items;
      let stockAvailable = true;
      for (const item of itemsToDeduct) {
        const prod = inventory.products.find(p => p.id === item.productId);
        if (!prod || prod.stock < item.quantity) {
          stockAvailable = false;
          showToast(`رصيد ${item.name} غير كافٍ للاستعادة`, "error");
          return;
        }
      }
      if (stockAvailable) {
        itemsToDeduct.forEach(item => inventory.deductStock(item.productId, item.quantity));
      }
    }
    salesData.restoreInvoice(id);
  };

  const handleDeleteInvoice = (id: string, reason: string, restoreStock: boolean) => {
    if (restoreStock) {
      const inv = salesData.invoices.find(i => i.id === id);
      inv?.items.forEach(item => inventory.restockItem(item.productId, item.quantity));
    }
    salesData.deleteInvoice(id, reason);
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard 
          invoices={salesData.invoices.filter(i => !i.isDeleted)} 
          returns={salesData.returns.filter(r => !r.isDeleted)} 
          expenses={salesData.expenses} 
          products={inventory.products.filter(p => !p.isDeleted)}
          onProductClick={handleShowProductDetails}
        />;
      case 'sales':
        return <Sales 
          products={inventory.products.filter(p => !p.isDeleted)} 
          invoices={salesData.invoices.filter(i => !i.isDeleted)}
          onSaveInvoice={salesData.saveInvoice}
          onDeductStock={inventory.deductStock}
          onGoToView={(view) => setView(view)}
          onShowToast={showToast}
        />;
      case 'inventory':
        return <Inventory 
          products={inventory.products} 
          onAddProduct={inventory.addProduct} 
          onUpdateProduct={inventory.updateProduct}
          onUpdateStock={inventory.updateStockWAC}
          onDeleteProduct={inventory.deleteProduct}
          onProductClick={handleShowProductDetails}
          onShowToast={showToast}
        />;
      case 'returns':
        return <Returns 
          invoices={salesData.invoices.filter(i => !i.isDeleted)} 
          returns={salesData.returns}
          onAddReturn={salesData.addReturn}
          onDeleteReturn={salesData.deleteReturn}
          onRestockItem={inventory.restockItem}
          onShowToast={showToast}
        />;
      case 'customers':
        return <Customers 
          invoices={salesData.invoices} 
          onShowToast={showToast}
        />;
      case 'expenses':
        return <Expenses 
          expenses={salesData.expenses} 
          onAddExpense={salesData.addExpense} 
        />;
      case 'reports':
        return <Reports 
          invoices={salesData.invoices.filter(i => !i.isDeleted)} 
          returns={salesData.returns.filter(r => !r.isDeleted)} 
          expenses={salesData.expenses} 
        />;
      case 'archive':
        return <Archive 
          invoices={salesData.invoices} 
          onDeleteInvoice={handleDeleteInvoice}
          onGoToView={(view) => setView(view)}
          onShowToast={showToast}
        />;
      case 'recycleBin':
        return <RecycleBin 
          deletedInvoices={salesData.invoices.filter(i => i.isDeleted)}
          deletedProducts={inventory.products.filter(p => p.isDeleted)}
          deletedReturns={salesData.returns.filter(r => r.isDeleted)}
          onRestoreInvoice={handleRestoreInvoice}
          onPermanentlyDeleteInvoice={salesData.permanentlyDeleteInvoice}
          onEmptyInvoiceBin={salesData.emptyInvoiceBin}
          onRestoreProduct={inventory.restoreProduct}
          onPermanentlyDeleteProduct={inventory.permanentlyDeleteProduct}
          onEmptyProductBin={inventory.emptyProductBin}
          onRestoreReturn={salesData.restoreReturn}
          onPermanentlyDeleteReturn={salesData.permanentlyDeleteReturn}
          onEmptyReturnBin={salesData.emptyReturnBin}
          onShowToast={showToast}
        />;
      default:
        return <Dashboard 
          invoices={salesData.invoices.filter(i => !i.isDeleted)} 
          returns={salesData.returns.filter(r => !r.isDeleted)} 
          expenses={salesData.expenses} 
          products={inventory.products.filter(p => !p.isDeleted)}
          onProductClick={handleShowProductDetails}
        />;
    }
  };

  return (
    <Layout 
      currentView={currentView} 
      setView={setView} 
      products={inventory.products}
      onReset={salesData.executeReset}
      onRestore={handleRestore}
      onProductClick={handleShowProductDetails}
      toast={toast}
      onCloseToast={() => setToast(null)}
    >
      <div className="animate-in">
        {renderView()}
      </div>

      {selectedDetailProduct && (
        <ProductDetailsModal 
          product={selectedDetailProduct} 
          onClose={() => setSelectedDetailProduct(null)} 
        />
      )}
    </Layout>
  );
};

export default App;
