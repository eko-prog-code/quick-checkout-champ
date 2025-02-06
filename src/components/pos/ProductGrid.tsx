import { useState } from "react";
import { Product } from "@/types/pos";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, X, Search } from "lucide-react";
import { formatIDR } from "@/lib/currency";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { updateProduct } from "@/services/productService";
import { useToast } from "@/components/ui/use-toast";

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onDeleteProduct?: (productId: string) => void;
  showEditButton?: boolean; // Prop baru untuk mengontrol tombol edit
  onEditProduct?: (product: Product) => Promise<void>;
}

const ProductGrid = ({ 
  products, 
  onAddToCart, 
  onDeleteProduct, 
  showEditButton = false,
  onEditProduct 
}: ProductGridProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    regularPrice: "",
    stock: "",
  });
  const { toast } = useToast();

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = async (product: Product) => {
    if (onEditProduct) {
      await onEditProduct(product);
    } else {
      setEditingProduct(product);
      setEditForm({
        name: product.name,
        regularPrice: product.regularPrice.toString(),
        stock: product.stock.toString(),
      });
    }
  };

  const handleUpdate = async () => {
    if (!editingProduct) return;

    try {
      const updatedProduct = {
        ...editingProduct,
        name: editForm.name,
        regularPrice: parseFloat(editForm.regularPrice),
        stock: parseInt(editForm.stock),
      };

      await updateProduct(updatedProduct);
      setEditingProduct(null);
      toast({
        title: "Sukses",
        description: "Data produk berhasil diperbarui",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memperbarui data produk",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari nama produk..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="p-4 relative">
            {onDeleteProduct && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 z-10"
                onClick={() => onDeleteProduct(product.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <h3 className="font-bold text-lg mb-2">{product.name}</h3>
            <div className="space-y-1 mb-4">
              <p className="text-lg font-semibold">
                {formatIDR(product.regularPrice)}
              </p>
              <p className="text-sm text-muted-foreground">
                Stok: {product.stock}
              </p>
            </div>
            <div className="flex gap-2">
              {showEditButton && (
                <Button
                  onClick={() => handleEdit(product)}
                  className="flex-1"
                  variant="outline"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
              <Button
                onClick={() => onAddToCart(product)}
                className="flex-1"
                disabled={product.stock === 0}
              >
                Tambah
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Produk</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nama Produk</Label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Nama produk"
              />
            </div>
            <div>
              <Label>Harga</Label>
              <Input
                value={editForm.regularPrice}
                onChange={(e) => setEditForm({ ...editForm, regularPrice: e.target.value })}
                placeholder="Harga produk"
                type="number"
              />
            </div>
            <div>
              <Label>Stok</Label>
              <Input
                value={editForm.stock}
                onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                placeholder="Jumlah stok"
                type="number"
              />
            </div>
            <Button onClick={handleUpdate} className="w-full">
              Update
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductGrid;
