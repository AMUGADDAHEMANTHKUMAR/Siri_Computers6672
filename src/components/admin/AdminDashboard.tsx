import React, { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { ProductManagement } from './ProductManagement';
import { AddProduct } from './AddProduct';
import { ImportProducts } from './ImportProducts';
import { AdminStats } from './AdminStats';

type AdminView = 'dashboard' | 'products' | 'add-product' | 'import';

export const AdminDashboard: React.FC = () => {
  const [currentView, setCurrentView] = useState<AdminView>('dashboard');

  const renderView = () => {
    switch (currentView) {
      case 'products':
        return <ProductManagement />;
      case 'add-product':
        return <AddProduct onBack={() => setCurrentView('products')} />;
      case 'import':
        return <ImportProducts onBack={() => setCurrentView('products')} />;
      default:
        return <AdminStats onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="flex">
        <AdminSidebar currentView={currentView} onViewChange={(view) => setCurrentView(view as AdminView)} />
        <main className="flex-1 p-6">
          {renderView()}
        </main>
      </div>
    </div>
  );
};