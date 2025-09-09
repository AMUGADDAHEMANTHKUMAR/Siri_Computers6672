import React, { useState } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Product } from '@/contexts/CartContext';
import { categories } from '@/data/products';

interface AddProductProps {
  onBack: () => void;
}

export const AddProduct: React.FC<AddProductProps> = ({ onBack }) => {
  const { addProduct } = useAdmin();
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string>('');
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm({
    defaultValues: {
      name: '',
      category: '',
      brand: '',
      price: '',
      discountPrice: '',
      image: '',
      specs: '',
      rating: 4.5,
      inStock: true,
    }
  });

  const watchImage = watch('image');

  React.useEffect(() => {
    setImagePreview(watchImage);
  }, [watchImage]);

  const onSubmit = (data: any) => {
    const category = showCustomCategory ? customCategory : data.category;
    const newProduct: Omit<Product, 'id'> = {
      name: data.name,
      category: category,
      brand: data.brand,
      price: Number(data.price),
      discountPrice: data.discountPrice ? Number(data.discountPrice) : undefined,
      image: data.image || '/placeholder.svg',
      specs: data.specs,
      rating: Number(data.rating),
      inStock: data.inStock,
    };

    addProduct(newProduct);
    
    toast({
      title: "Product Added",
      description: "New product has been successfully added to inventory.",
    });
    
    reset();
    onBack();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Add New Product</h1>
          <p className="text-muted-foreground">Add a new product to your inventory</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
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
                  {!showCustomCategory ? (
                    <Select 
                      value={watch('category')} 
                      onValueChange={(value) => {
                        if (value === 'other') {
                          setShowCustomCategory(true);
                          setValue('category', '');
                        } else {
                          setValue('category', value);
                        }
                      }}
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
                        <SelectItem value="other">Other (Custom)</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="space-y-2">
                      <Input
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        placeholder="Enter custom category"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowCustomCategory(false);
                          setCustomCategory('');
                        }}
                      >
                        Choose from list instead
                      </Button>
                    </div>
                  )}
                  {errors.category && !showCustomCategory && (
                    <p className="text-sm text-red-600">Please select a category</p>
                  )}
                  {showCustomCategory && !customCategory && (
                    <p className="text-sm text-red-600">Please enter a custom category</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    {...register('brand')}
                    placeholder="Enter brand name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
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
                      placeholder="Optional"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rating">Rating (1-5)</Label>
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

                <div className="flex items-center space-x-2">
                  <Switch
                    id="inStock"
                    checked={watch('inStock')}
                    onCheckedChange={(checked) => setValue('inStock', checked)}
                  />
                  <Label htmlFor="inStock">In Stock</Label>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="image">Image URL</Label>
                  <Input
                    id="image"
                    {...register('image')}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Image Preview</Label>
                  <div className="w-full h-48 border border-dashed border-muted-foreground rounded-lg flex items-center justify-center bg-muted/30">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-w-full max-h-full object-contain rounded"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                    ) : (
                      <div className="text-center">
                        <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Enter image URL to see preview
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specs">Specifications</Label>
                  <Textarea
                    id="specs"
                    {...register('specs')}
                    placeholder="Enter detailed product specifications"
                    rows={4}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-6">
              <Button type="button" variant="outline" onClick={onBack}>
                Cancel
              </Button>
              <Button type="submit">
                Add Product
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};