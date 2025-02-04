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

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    regularPrice: "",
    wholesalePrice: "",
    stock: "",
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Subscribe to products
    const unsubscribe = subscribeToProducts((updatedProducts) => {
      setProducts(updatedProducts);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.regularPrice || !newProduct.stock || !selectedImage) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields and select an image",
        variant: "destructive",
      });
      return;
    }

    try {
      await createProduct(
        {
          name: newProduct.name,
          regularPrice: parseFloat(newProduct.regularPrice),
          wholesalePrice: parseFloat(newProduct.wholesalePrice || "0"),
          stock: parseInt(newProduct.stock),
          image: "", // This will be set by the service
        },
        selectedImage
      );

      setIsOpen(false);
      setNewProduct({
        name: "",
        regularPrice: "",
        wholesalePrice: "",
        stock: "",
      });
      setSelectedImage(null);

      toast({
        title: "Product added",
        description: "The product has been added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add product. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteProduct(productId);
      toast({
        title: "Product deleted",
        description: "The product has been removed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
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
              <div>
                <Label htmlFor="image">Product Image</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
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