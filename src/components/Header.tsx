import React, { useState } from 'react';
import { Search, ShoppingCart, Menu, X, Monitor, Settings, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/contexts/CartContext';
import { useAdmin } from '@/contexts/AdminContext';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  onSearch: (query: string) => void;
  onCartOpen: () => void;
  searchQuery?: string;
  onClearSearch?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSearch, onCartOpen, searchQuery: propSearchQuery = '', onClearSearch }) => {
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { getTotalItems } = useCart();
  const { isAdminMode, toggleAdminMode } = useAdmin();
  const totalItems = getTotalItems();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(localSearchQuery);
  };

  const handleClearSearch = () => {
    setLocalSearchQuery('');
    onClearSearch?.();
  };

  const handleNavClick = (category: string) => {
    setIsMobileMenuOpen(false);
    if (category === 'Services') {
      // Handle services differently
      return;
    }
    onSearch('');
    setLocalSearchQuery('');
    // Trigger category filter
    window.dispatchEvent(new CustomEvent('filterByCategory', { detail: category }));
  };

  const navItems = [
    { name: 'Processors', category: 'Processor' },
    { name: 'Graphics Cards', category: 'Graphics Card' },
    { name: 'Memory', category: 'Memory' },
    { name: 'Storage', category: 'Storage' },
    { name: 'Services', category: 'Services' }
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        {/* Top Bar */}
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <Monitor className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary">TechShop</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Computer Parts & Repair</p>
            </div>
          </div>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search for computer parts..."
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
                className="pl-10 pr-10 bg-muted/50 border-0 focus:bg-background transition-colors"
              />
              {(localSearchQuery || propSearchQuery) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClearSearch}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
          </form>

          {/* Admin Toggle & Cart & Mobile Menu */}
          <div className="flex items-center space-x-2">
            {/* Admin Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleAdminMode}
              className={isAdminMode ? "bg-primary/10 text-primary" : ""}
            >
              {isAdminMode ? <User className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
              <span className="hidden sm:inline ml-2">
                {isAdminMode ? 'Customer' : 'Admin'}
              </span>
            </Button>

            {/* Cart Button */}
            <Button
              variant="outline"
              size="sm" 
              onClick={onCartOpen}
              className="relative btn-secondary-outline"
            >
              <ShoppingCart className="w-4 h-4" />
              {totalItems > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 px-1.5 py-0.5 text-xs cart-bounce bg-accent hover:bg-accent"
                >
                  {totalItems}
                </Badge>
              )}
              <span className="hidden sm:inline ml-2">Cart</span>
            </Button>

            {/* Mobile Menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col h-full">
                  {/* Mobile Search */}
                  <form onSubmit={handleSearch} className="mb-6">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        type="text"
                        placeholder="Search products..."
                        value={localSearchQuery}
                        onChange={(e) => setLocalSearchQuery(e.target.value)}
                        className="pl-10 pr-10"
                      />
                      {(localSearchQuery || propSearchQuery) && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleClearSearch}
                          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </form>

                  {/* Mobile Navigation */}
                  <nav className="flex-1">
                    <ul className="space-y-3">
                       {navItems.map((item) => (
                         <li key={item.name}>
                           <button
                             onClick={() => handleNavClick(item.category)}
                             className="block w-full text-left py-3 px-4 rounded-lg text-foreground hover:bg-muted transition-colors"
                           >
                             {item.name}
                           </button>
                         </li>
                       ))}
                    </ul>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:block border-t border-border/50">
          <ul className="flex items-center space-x-8 py-3">
            {navItems.map((item) => (
              <li key={item.name}>
                <button
                  onClick={() => handleNavClick(item.category)}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors relative group"
                >
                  {item.name}
                  <span className="absolute -bottom-3 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;