import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import ProductGrid from "@/components/pos/ProductGrid";
import { Product } from "@/types/pos";
import { useToast } from "@/components/ui/use-toast";
import { createProduct, deleteProduct, subscribeToProducts } from "@/services/productService";
import { formatNumber } from "@/lib/utils";

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    regularPrice: "",
    stock: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = subscribeToProducts((updatedProducts) => {
      setProducts(updatedProducts);
    });

    return () => unsubscribe();
  }, []);

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.regularPrice || !newProduct.stock) {
      toast({
        title: "Data tidak lengkap",
        description: "Mohon isi semua field yang diperlukan",
        variant: "destructive",
      });
      return;
    }

    try {
      await createProduct({
        name: newProduct.name,
        regularPrice: parseFloat(newProduct.regularPrice.replace(/\./g, '')),
        stock: parseInt(newProduct.stock),
        image: "/placeholder.svg",
      });

      setIsOpen(false);
      setNewProduct({
        name: "",
        regularPrice: "",
        stock: "",
      });

      toast({
        title: "Produk ditambahkan",
        description: "Produk berhasil ditambahkan ke sistem",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menambahkan produk. Silakan coba lagi.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteProduct(productId);
      toast({
        title: "Produk dihapus",
        description: "Produk berhasil dihapus dari sistem",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menghapus produk. Silakan coba lagi.",
        variant: "destructive",
      });
    }
  };

  const handlePriceBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\./g, '');
    if (value) {
      const formattedValue = formatNumber(parseFloat(value));
      setNewProduct(prev => ({ ...prev, regularPrice: formattedValue }));
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manajemen Produk</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Produk
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Produk Baru</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nama Produk</Label>
                <Input
                  id="name"
                  value={newProduct.name}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="regularPrice">Harga</Label>
                <Input
                  id="regularPrice"
                  value={newProduct.regularPrice}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, regularPrice: e.target.value })
                  }
                  onBlur={handlePriceBlur}
                />
              </div>
              <div>
                <Label htmlFor="stock">Stok</Label>
                <Input
                  id="stock"
                  type="number"
                  value={newProduct.stock}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, stock: e.target.value })
                  }
                />
              </div>
              <Button onClick={handleAddProduct} className="w-full">
                Tambah Produk
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <ProductGrid
        products={products}
        onAddToCart={() => {}}
        onDeleteProduct={handleDeleteProduct}
      />
    </div>
  );
};

export default Products;