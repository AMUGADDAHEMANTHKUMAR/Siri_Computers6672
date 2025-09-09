import React, { useState, useCallback, useEffect } from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import ProductGrid from '@/components/ProductGrid';
import Cart from '@/components/Cart';
import { AdminLogin } from '@/components/admin/AdminLogin';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { useAdmin } from '@/contexts/AdminContext';
import { products } from '@/data/products';
import { Toaster } from '@/components/ui/sonner';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { isAdminMode, isAuthenticated, products: adminProducts } = useAdmin();

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query.trim());
  }, []);

  const handleCartOpen = useCallback(() => {
    setIsCartOpen(true);
  }, []);

  const handleCartClose = useCallback(() => {
    setIsCartOpen(false);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  // Show admin login if in admin mode but not authenticated
  if (isAdminMode && !isAuthenticated) {
    return <AdminLogin />;
  }

  // Show admin dashboard if in admin mode and authenticated
  if (isAdminMode && isAuthenticated) {
    return <AdminDashboard />;
  }

  // Show customer interface
  const displayProducts = adminProducts.length > 0 ? adminProducts : products;

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onSearch={handleSearch} 
        onCartOpen={handleCartOpen} 
        searchQuery={searchQuery}
        onClearSearch={handleClearSearch}
      />
      <main>
        {!searchQuery.trim() && <HeroSection />}
        <ProductGrid searchQuery={searchQuery} products={displayProducts} />
      </main>
      <Cart isOpen={isCartOpen} onClose={handleCartClose} />
      <Toaster position="top-right" />
    </div>
  );
};

export default Index;
