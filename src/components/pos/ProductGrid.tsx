import { Product } from "@/types/pos";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, X, Search } from "lucide-react";
import { formatIDR } from "@/lib/currency";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onDeleteProduct?: (productId: string) => void;
}

const ProductGrid = ({ products, onAddToCart, onDeleteProduct }: ProductGridProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <Button
              onClick={() => onAddToCart(product)}
              className="w-full"
              disabled={product.stock === 0}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;