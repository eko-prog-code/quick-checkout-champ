import { useState } from "react";
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

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    regularPrice: "",
    wholesalePrice: "",
    stock: "",
    image: "/placeholder.svg",
  });
  const { toast } = useToast();

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.regularPrice || !newProduct.stock) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const product: Product = {
      id: Date.now().toString(),
      name: newProduct.name,
      regularPrice: parseFloat(newProduct.regularPrice),
      wholesalePrice: parseFloat(newProduct.wholesalePrice || "0"),
      stock: parseInt(newProduct.stock),
      image: newProduct.image,
    };

    setProducts([...products, product]);
    setIsOpen(false);
    setNewProduct({
      name: "",
      regularPrice: "",
      wholesalePrice: "",
      stock: "",
      image: "/placeholder.svg",
    });

    toast({
      title: "Product added",
      description: "The product has been added successfully",
    });
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts(products.filter((p) => p.id !== productId));
    toast({
      title: "Product deleted",
      description: "The product has been removed successfully",
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products Management</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  value={newProduct.name}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="regularPrice">Regular Price</Label>
                <Input
                  id="regularPrice"
                  type="number"
                  value={newProduct.regularPrice}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, regularPrice: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="wholesalePrice">Wholesale Price</Label>
                <Input
                  id="wholesalePrice"
                  type="number"
                  value={newProduct.wholesalePrice}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      wholesalePrice: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="stock">Stock</Label>
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
                Add Product
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