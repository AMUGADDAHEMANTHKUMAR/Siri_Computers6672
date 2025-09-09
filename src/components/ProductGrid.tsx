import React, { useState, useMemo, useEffect } from 'react';
import { Filter, Grid, List, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import ProductCard from './ProductCard';
import { categories, brands } from '@/data/products';
import { Product } from '@/contexts/CartContext';
import { useAdmin } from '@/contexts/AdminContext';

interface ProductGridProps {
  searchQuery: string;
  products?: Product[];
}

const ProductGrid: React.FC<ProductGridProps> = ({ searchQuery, products: propProducts }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { products: adminProducts } = useAdmin();

  // Listen for category filter events from navigation
  useEffect(() => {
    const handleCategoryFilter = (event: CustomEvent) => {
      setSelectedCategory(event.detail);
      setIsFiltersOpen(false); // Close mobile filters when navigating
    };

    window.addEventListener('filterByCategory' as any, handleCategoryFilter);
    return () => window.removeEventListener('filterByCategory' as any, handleCategoryFilter);
  }, []);

  // Use admin products if available, otherwise use provided products
  const allProducts = adminProducts.length > 0 ? adminProducts : (propProducts || []);

  // Debounced search for better performance
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, selectedBrand, sortBy, priceRange]);

  // Filter and sort products with improved search
  const filteredProducts = useMemo(() => {
    if (!allProducts || allProducts.length === 0) return [];
    
    let filtered = allProducts.filter(product => {
      // Enhanced search filter - search in multiple fields
      if (searchQuery && searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const searchFields = [
          product.name?.toLowerCase() || '',
          product.category?.toLowerCase() || '',
          product.specs?.toLowerCase() || '',
          product.brand?.toLowerCase() || ''
        ];
        
        const matchesSearch = searchFields.some(field => 
          field.includes(query)
        );
        
        if (!matchesSearch) return false;
      }

      // Category filter
      if (selectedCategory !== 'All' && product.category !== selectedCategory) {
        return false;
      }

      // Brand filter  
      if (selectedBrand !== 'All' && product.brand !== selectedBrand) {
        return false;
      }

      // Price range filter
      const productPrice = product.discountPrice || product.price;
      if (priceRange.min && productPrice < parseInt(priceRange.min)) {
        return false;
      }
      if (priceRange.max && productPrice > parseInt(priceRange.max)) {
        return false;
      }

      return true;
    });

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return (a.discountPrice || a.price) - (b.discountPrice || b.price);
        case 'price-high':
          return (b.discountPrice || b.price) - (a.discountPrice || a.price);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'discount':
          const aDiscount = a.discountPrice ? ((a.price - a.discountPrice) / a.price) * 100 : 0;
          const bDiscount = b.discountPrice ? ((b.price - b.discountPrice) / b.price) * 100 : 0;
          return bDiscount - aDiscount;
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [allProducts, searchQuery, selectedCategory, selectedBrand, sortBy, priceRange]);

  const clearFilters = () => {
    setSelectedCategory('All');
    setSelectedBrand('All');
    setSortBy('name');
    setPriceRange({ min: '', max: '' });
  };

  const activeFiltersCount = [
    selectedCategory !== 'All',
    selectedBrand !== 'All',
    priceRange.min || priceRange.max,
  ].filter(Boolean).length;

  return (
    <section className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold">
            {searchQuery ? `Search Results for "${searchQuery}"` : 'Computer Components'}
          </h2>
          <p className="text-muted-foreground mt-1">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile Filters Toggle */}
          <Button
            variant="outline"
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className="lg:hidden relative"
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge className="absolute -top-2 -right-2 px-1.5 py-0.5 text-xs bg-accent hover:bg-accent">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>

          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name A-Z</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="discount">Best Discount</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Desktop Filters Sidebar */}
        <div className="hidden lg:block space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Filters</h3>
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear all
              </Button>
            )}
          </div>

          {/* Category Filter */}
          <div>
            <h4 className="font-medium mb-3">Category</h4>
            <div className="space-y-2">
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Brand Filter */}
          <div>
            <h4 className="font-medium mb-3">Brand</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {brands.map(brand => (
                <Button
                  key={brand}
                  variant={selectedBrand === brand ? "default" : "ghost"}
                  size="sm"
                  className="w-full justify-start text-left"
                  onClick={() => setSelectedBrand(brand)}
                >
                  {brand}
                </Button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div>
            <h4 className="font-medium mb-3">Price Range</h4>
            <div className="space-y-2">
              <Input
                type="number"
                placeholder="Min price"
                value={priceRange.min}
                onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
              />
              <Input
                type="number"
                placeholder="Max price"
                value={priceRange.max}
                onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
              />
            </div>
          </div>
        </div>

        {/* Mobile Filters */}
        <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen} className="lg:hidden col-span-full">
          <CollapsibleContent className="bg-muted/50 rounded-lg p-4 mb-6 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Brand</label>
                <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map(brand => (
                      <SelectItem key={brand} value={brand}>
                        {brand}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Min price"
                value={priceRange.min}
                onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
              />
              <Input
                type="number"
                placeholder="Max price"
                value={priceRange.max}
                onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
              />
            </div>

            {activeFiltersCount > 0 && (
              <Button variant="outline" size="sm" onClick={clearFilters} className="w-full">
                Clear all filters
              </Button>
            )}
          </CollapsibleContent>
        </Collapsible>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-card rounded-lg p-4 animate-pulse">
                  <div className="bg-muted h-48 rounded-md mb-4"></div>
                  <div className="bg-muted h-4 rounded mb-2"></div>
                  <div className="bg-muted h-4 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Grid className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery ? 'No products match your search' : 'No products found'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery 
                  ? `No results for "${searchQuery}". Try different keywords or clear filters.`
                  : 'Try adjusting your filters or add some products via admin panel.'
                }
              </p>
              <div className="space-x-2">
                {searchQuery && (
                  <Button variant="default" onClick={() => window.location.reload()}>
                    Clear search
                  </Button>
                )}
                <Button variant="outline" onClick={clearFilters}>
                  Clear filters
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;