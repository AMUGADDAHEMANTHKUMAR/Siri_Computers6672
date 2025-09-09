import React from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Product } from '@/contexts/CartContext';
import { categories } from '@/data/products';

interface EditProductDialogProps {
  productId: number;
  onClose: () => void;
}

export const EditProductDialog: React.FC<EditProductDialogProps> = ({ 
  productId, 
  onClose 
}) => {
  const { products, updateProduct } = useAdmin();
  const { toast } = useToast();
  
  const product = products.find(p => p.id === productId);
  
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    defaultValues: product ? {
      name: product.name,
      category: product.category,
      brand: product.brand || '',
      price: product.price,
      discountPrice: product.discountPrice || '',
      image: product.image,
      specs: product.specs,
      rating: product.rating || 4.5,
      inStock: product.inStock,
    } : {}
  });

  if (!product) return null;

  const onSubmit = (data: any) => {
    const updatedProduct: Partial<Product> = {
      name: data.name,
      category: data.category,
      brand: data.brand,
      price: Number(data.price),
      discountPrice: data.discountPrice ? Number(data.discountPrice) : undefined,
      image: data.image,
      specs: data.specs,
      rating: Number(data.rating),
      inStock: data.inStock,
    };

    updateProduct(productId, updatedProduct);
    
    toast({
      title: "Product Updated",
      description: "Product has been successfully updated.",
    });
    
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                {...register('name', { required: 'Product name is required' })}
                placeholder="Enter product name"
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select 
                value={watch('category')} 
                onValueChange={(value) => setValue('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.slice(1).map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                {...register('brand')}
                placeholder="Enter brand name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                {...register('price', { required: 'Price is required', min: 0 })}
                placeholder="0"
              />
              {errors.price && (
                <p className="text-sm text-red-600">{errors.price.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="discountPrice">Discount Price</Label>
              <Input
                id="discountPrice"
                type="number"
                {...register('discountPrice', { min: 0 })}
                placeholder="Optional discount price"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rating">Rating</Label>
              <Input
                id="rating"
                type="number"
                step="0.1"
                min="1"
                max="5"
                {...register('rating', { min: 1, max: 5 })}
                placeholder="4.5"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                {...register('image')}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="specs">Specifications</Label>
              <Textarea
                id="specs"
                {...register('specs')}
                placeholder="Enter detailed product specifications"
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="inStock"
                checked={watch('inStock')}
                onCheckedChange={(checked) => setValue('inStock', checked)}
              />
              <Label htmlFor="inStock">In Stock</Label>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Update Product
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};