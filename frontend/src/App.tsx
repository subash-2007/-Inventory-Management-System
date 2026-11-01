import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { ProductsPage } from './pages/Products';
import { CategoriesPage } from './pages/Categories';
import { SuppliersPage } from './pages/Suppliers';
import { StockManagementPage } from './pages/StockManagement';
import { PurchaseManagementPage } from './pages/PurchaseManagement';
import { StockMovementsPage } from './pages/StockMovements';
import { ReportsPage } from './pages/Reports';
import { SettingsPage } from './pages/Settings';
import { getProducts } from './services/api';
import { Product } from './types';

export function App() {
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [quickAddProductOpen, setQuickAddProductOpen] = useState(false);

  const fetchLowStockAlerts = async () => {
    try {
      const res = await getProducts({ stock_status: 'low', limit: 50 });
      const outRes = await getProducts({ stock_status: 'out', limit: 50 });
      setLowStockProducts([...res.products, ...outRes.products]);
    } catch (err) {
      console.error('Error fetching low stock alerts:', err);
    }
  };

  useEffect(() => {
    fetchLowStockAlerts();
  }, [refreshKey, currentPage]);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
    fetchLowStockAlerts();
  };

  const getPageTitle = () => {
    switch (currentPage) {
      case 'dashboard':
        return { title: 'Dashboard', subtitle: 'Overview of stock metrics, valuation & procurement trends' };
      case 'products':
        return { title: 'Products', subtitle: 'Manage items catalog, pricing, SKU and inventory balances' };
      case 'categories':
        return { title: 'Categories', subtitle: 'Product classifications, groupings, and category counts' };
      case 'suppliers':
        return { title: 'Suppliers', subtitle: 'Vendor contact information, addresses, and supply portfolios' };
      case 'stock':
        return { title: 'Stock Management', subtitle: 'Stock additions, issues/reductions, and count adjustments' };
      case 'purchases':
        return { title: 'Purchase Management', subtitle: 'Purchase orders, multi-product receipt, and supplier procurement' };
      case 'movements':
        return { title: 'Stock Movements', subtitle: 'Complete audit log of all inbound, outbound, and adjustment events' };
      case 'reports':
        return { title: 'Reports & Analytics', subtitle: 'Stock valuation, low stock lists, and downloadable CSV summaries' };
      case 'settings':
        return { title: 'Settings', subtitle: 'Application parameters, company profile, and diagnostics' };
      default:
        return { title: 'Inventory Management', subtitle: 'Auspify Technologies' };
    }
  };

  const pageInfo = getPageTitle();

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans antialiased text-slate-800">
      {/* Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onPageChange={(page) => setCurrentPage(page)}
        lowStockCount={lowStockProducts.length}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header
          title={pageInfo.title}
          subtitle={pageInfo.subtitle}
          lowStockProducts={lowStockProducts}
          onRefresh={handleRefresh}
          onNavigate={(page) => setCurrentPage(page)}
          onQuickAddProduct={() => {
            setCurrentPage('products');
            setQuickAddProductOpen(true);
          }}
        />

        <main className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/60 pb-16">
          {currentPage === 'dashboard' && (
            <Dashboard
              key={refreshKey}
              onNavigate={(page) => setCurrentPage(page)}
              onOpenAddProduct={() => {
                setCurrentPage('products');
                setQuickAddProductOpen(true);
              }}
            />
          )}

          {currentPage === 'products' && (
            <ProductsPage
              key={refreshKey}
              isAddModalOpen={quickAddProductOpen}
              onCloseAddModal={() => setQuickAddProductOpen(false)}
            />
          )}

          {currentPage === 'categories' && <CategoriesPage key={refreshKey} />}

          {currentPage === 'suppliers' && <SuppliersPage key={refreshKey} />}

          {currentPage === 'stock' && <StockManagementPage key={refreshKey} />}

          {currentPage === 'purchases' && <PurchaseManagementPage key={refreshKey} />}

          {currentPage === 'movements' && <StockMovementsPage key={refreshKey} />}

          {currentPage === 'reports' && <ReportsPage key={refreshKey} />}

          {currentPage === 'settings' && <SettingsPage key={refreshKey} />}
        </main>
      </div>
    </div>
  );
}

export default App;
