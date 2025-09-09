import React from 'react';
import { Star, ShoppingCart, Heart, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Product } from '@/contexts/CartContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { addToCart, isInCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = () => {
    addToCart(product);
    toast({
      title: "Added to cart!",
      description: `${product.name} has been added to your cart.`,
      duration: 2000,
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const discountPercentage = product.discountPrice 
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <Card className="product-card group relative overflow-hidden bg-card">
      {/* Discount Badge */}
      {discountPercentage > 0 && (
        <Badge className="absolute top-3 left-3 z-10 bg-success hover:bg-success text-success-foreground">
          {discountPercentage}% OFF
        </Badge>
      )}

      {/* Stock Status */}
      {!product.inStock && (
        <Badge variant="destructive" className="absolute top-3 right-3 z-10">
          Out of Stock
        </Badge>
      )}

      {/* Quick Actions */}
      <div className="absolute top-3 right-3 z-10 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="outline"
          size="sm"
          className="w-8 h-8 p-0 bg-background/80 backdrop-blur-sm"
          onClick={() => onQuickView?.(product)}
        >
          <Eye className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-8 h-8 p-0 bg-background/80 backdrop-blur-sm"
        >
          <Heart className="w-4 h-4" />
        </Button>
      </div>

      <CardContent className="p-4">
        {/* Product Image */}
        <div className="aspect-square mb-4 bg-muted rounded-lg overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Product Info */}
        <div className="space-y-2">
          {/* Brand & Category */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{product.brand}</span>
            <Badge variant="outline" className="text-xs">
              {product.category}
            </Badge>
          </div>

          {/* Product Name */}
          <h3 className="font-semibold text-sm leading-tight line-clamp-2">
            {product.name}
          </h3>

          {/* Specifications */}
          <p className="text-xs text-muted-foreground line-clamp-2">
            {product.specs}
          </p>

          {/* Rating */}
          {product.rating && (
            <div className="flex items-center space-x-1">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < Math.floor(product.rating!)
                        ? 'text-yellow-400 fill-current'
                        : 'text-muted-foreground'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">({product.rating})</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        {/* Pricing */}
        <div className="w-full space-y-3">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-primary">
              {formatPrice(product.discountPrice || product.price)}
            </span>
            {product.discountPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className={`w-full ${
              isInCart(product.id) 
                ? 'bg-success hover:bg-success text-success-foreground' 
                : 'btn-hero'
            }`}
            size="sm"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {!product.inStock 
              ? 'Out of Stock'
              : isInCart(product.id) 
                ? 'In Cart' 
                : 'Add to Cart'
            }
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;