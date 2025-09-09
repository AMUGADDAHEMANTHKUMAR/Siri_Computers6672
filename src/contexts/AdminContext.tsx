import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product } from '@/contexts/CartContext';

interface AdminContextType {
  isAdminMode: boolean;
  isAuthenticated: boolean;
  toggleAdminMode: () => void;
  login: (password: string) => boolean;
  logout: () => void;
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: number, product: Partial<Product>) => void;
  deleteProduct: (id: number) => void;
  deleteMultipleProducts: (ids: number[]) => void;
  bulkUpdateStock: (ids: number[], inStock: boolean) => void;
  importProducts: (products: Product[]) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const ADMIN_PASSWORD = 'admin123';
const ADMIN_STORAGE_KEY = 'techShopAdmin';
const PRODUCTS_STORAGE_KEY = 'techShopProducts';

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const saveProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(newProducts));
  };

  const toggleAdminMode = () => {
    if (!isAdminMode) {
      setIsAuthenticated(false);
    }
    setIsAdminMode(!isAdminMode);
  };

  const login = (password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setIsAdminMode(false);
  };

  const addProduct = (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...productData,
      id: Date.now(),
    };
    const updatedProducts = [...products, newProduct];
    saveProducts(updatedProducts);
  };

  const updateProduct = (id: number, productData: Partial<Product>) => {
    const updatedProducts = products.map(product =>
      product.id === id ? { ...product, ...productData } : product
    );
    saveProducts(updatedProducts);
  };

  const deleteProduct = (id: number) => {
    const updatedProducts = products.filter(product => product.id !== id);
    saveProducts(updatedProducts);
  };

  const deleteMultipleProducts = (ids: number[]) => {
    const updatedProducts = products.filter(product => !ids.includes(product.id));
    saveProducts(updatedProducts);
  };

  const bulkUpdateStock = (ids: number[], inStock: boolean) => {
    const updatedProducts = products.map(product =>
      ids.includes(product.id) ? { ...product, inStock } : product
    );
    saveProducts(updatedProducts);
  };

  const importProducts = (newProducts: Product[]) => {
    const productsWithIds = newProducts.map(product => ({
      ...product,
      id: product.id || Date.now() + Math.random(),
    }));
    saveProducts([...products, ...productsWithIds]);
  };

  const value: AdminContextType = {
    isAdminMode,
    isAuthenticated,
    toggleAdminMode,
    login,
    logout,
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    deleteMultipleProducts,
    bulkUpdateStock,
    importProducts,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};