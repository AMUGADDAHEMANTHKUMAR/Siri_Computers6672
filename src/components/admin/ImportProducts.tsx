import React, { useState } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Upload, Download, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import { Product } from '@/contexts/CartContext';

interface ImportProductsProps {
  onBack: () => void;
}

interface ImportedProduct {
  name: string;
  category: string;
  brand?: string;
  price: number;
  discountPrice?: number;
  image: string;
  specs: string;
  rating?: number;
  inStock: boolean;
}

export const ImportProducts: React.FC<ImportProductsProps> = ({ onBack }) => {
  const { importProducts } = useAdmin();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<ImportedProduct[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const downloadTemplate = () => {
    const template = [
      {
        'Product Name': 'AMD Ryzen 5 5600X',
        'Category': 'Processor',
        'Brand': 'AMD',
        'Price': 15999,
        'Discount Price': 13999,
        'Image URL': 'https://example.com/image.jpg',
        'Specifications': '6 Cores, 12 Threads, 3.7GHz Base Clock',
        'Rating': 4.8,
        'In Stock': 'Yes'
      },
      {
        'Product Name': 'NVIDIA RTX 4060 Ti',
        'Category': 'Graphics Card',
        'Brand': 'NVIDIA',
        'Price': 42999,
        'Discount Price': '',
        'Image URL': 'https://example.com/image2.jpg',
        'Specifications': '8GB GDDR6, 2535MHz Boost Clock',
        'Rating': 4.6,
        'In Stock': 'No'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Products');
    XLSX.writeFile(wb, 'product_template.xlsx');
    
    toast({
      title: "Template Downloaded",
      description: "Excel template has been downloaded successfully.",
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      processFile(selectedFile);
    }
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (jsonData.length < 2) {
        throw new Error('File must contain at least a header row and one data row');
      }

      const headers = jsonData[0] as string[];
      const rows = jsonData.slice(1) as any[][];

      const products: ImportedProduct[] = rows
        .filter(row => row.some(cell => cell !== undefined && cell !== ''))
        .map((row, index) => {
          const product: any = {};
          headers.forEach((header, i) => {
            product[header] = row[i];
          });

          return {
            name: product['Product Name'] || product['Name'] || `Product ${index + 1}`,
            category: product['Category'] || 'Uncategorized',
            brand: product['Brand'] || '',
            price: Number(product['Price']) || 0,
            discountPrice: product['Discount Price'] ? Number(product['Discount Price']) : undefined,
            image: product['Image URL'] || product['Image'] || '/placeholder.svg',
            specs: product['Specifications'] || product['Specs'] || '',
            rating: product['Rating'] ? Number(product['Rating']) : 4.5,
            inStock: product['In Stock'] === 'Yes' || product['In Stock'] === true || product['In Stock'] === 1,
          };
        });

      setPreviewData(products);
      toast({
        title: "File Processed",
        description: `Successfully processed ${products.length} products.`,
      });
    } catch (error) {
      toast({
        title: "Import Error",
        description: error instanceof Error ? error.message : "Failed to process file",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = () => {
    if (previewData.length === 0) return;

    const products: Product[] = previewData.map(item => ({
      id: Date.now() + Math.random(),
      ...item,
    }));

    importProducts(products);
    
    toast({
      title: "Import Successful",
      description: `${products.length} products have been imported successfully.`,
    });
    
    setFile(null);
    setPreviewData([]);
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
          <h1 className="text-3xl font-bold">Import Products</h1>
          <p className="text-muted-foreground">Import products from Excel or CSV files</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upload File</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Select Excel or CSV File</Label>
              <Input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                disabled={isProcessing}
              />
            </div>

            <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
              <FileSpreadsheet className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Drag & Drop or Click to Upload</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Supports .xlsx, .xls, and .csv files
              </p>
              {file && (
                <Badge variant="outline" className="mb-2">
                  {file.name}
                </Badge>
              )}
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Required Columns</h4>
                  <p className="text-sm text-muted-foreground">
                    Your file should include: Product Name, Category, Price
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Optional: Brand, Discount Price, Image URL, Specifications, Rating, In Stock
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Template & Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={downloadTemplate} className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Download Excel Template
            </Button>

            <div className="space-y-3">
              <h4 className="font-medium">Column Mapping:</h4>
              <div className="text-sm space-y-1">
                <div><strong>Product Name:</strong> Required product name</div>
                <div><strong>Category:</strong> Product category</div>
                <div><strong>Brand:</strong> Product brand (optional)</div>
                <div><strong>Price:</strong> Base price in rupees</div>
                <div><strong>Discount Price:</strong> Discounted price (optional)</div>
                <div><strong>Image URL:</strong> Product image URL (optional)</div>
                <div><strong>Specifications:</strong> Product details (optional)</div>
                <div><strong>Rating:</strong> 1-5 star rating (optional)</div>
                <div><strong>In Stock:</strong> Yes/No or True/False</div>
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-500">
              <h4 className="font-medium text-blue-900">Pro Tip</h4>
              <p className="text-sm text-blue-800">
                Download the template for the correct format and column names.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {previewData.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Preview ({previewData.length} products)</CardTitle>
              <Button onClick={handleImport}>
                <Upload className="w-4 h-4 mr-2" />
                Import Products
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto">
              <div className="grid gap-4">
                {previewData.slice(0, 10).map((product, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-12 h-12 rounded object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{product.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {product.category} • {product.brand} • ₹{product.price.toLocaleString()}
                      </p>
                    </div>
                    <Badge variant={product.inStock ? "default" : "destructive"}>
                      {product.inStock ? "In Stock" : "Out of Stock"}
                    </Badge>
                  </div>
                ))}
              </div>
              {previewData.length > 10 && (
                <p className="text-center text-muted-foreground mt-4">
                  And {previewData.length - 10} more products...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};