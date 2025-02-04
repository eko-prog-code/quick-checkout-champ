import { Product } from "@/types/pos";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { formatIDR } from "@/lib/currency";

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onDeleteProduct?: (productId: string) => void;
}

const ProductGrid = ({ products, onAddToCart, onDeleteProduct }: ProductGridProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((product) => (
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
          <Button
            onClick={() => onAddToCart(product)}
            className="w-full"
            disabled={product.stock === 0}
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah ke Keranjang
          </Button>
        </Card>
      ))}
    </div>
  );
};

export default ProductGrid;