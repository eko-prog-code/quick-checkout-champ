import { useState } from "react";
import ProductGrid from "@/components/pos/ProductGrid";
import Cart from "@/components/pos/Cart";
import { CartItem, Product } from "@/types/pos";
import { useToast } from "@/components/ui/use-toast";

// Sample products data
const sampleProducts: Product[] = [
  {
    id: "1",
    name: "T-Shirt",
    regularPrice: 29.99,
    wholesalePrice: 19.99,
    stock: 50,
    image: "/placeholder.svg",
  },
  {
    id: "2",
    name: "Jeans",
    regularPrice: 79.99,
    wholesalePrice: 59.99,
    stock: 30,
    image: "/placeholder.svg",
  },
  {
    id: "3",
    name: "Sneakers",
    regularPrice: 99.99,
    wholesalePrice: 79.99,
    stock: 20,
    image: "/placeholder.svg",
  },
];

const Index = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { toast } = useToast();

  const addToCart = (product: Product) => {
    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.id === product.id);
      if (existingItem) {
        if (existingItem.quantity >= product.stock) {
          toast({
            title: "Maximum stock reached",
            description: "Cannot add more of this item",
            variant: "destructive",
          });
          return prev;
        }
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === productId) {
          if (newQuantity > item.stock) {
            toast({
              title: "Maximum stock reached",
              description: "Cannot add more of this item",
              variant: "destructive",
            });
            return item;
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 p-6 overflow-auto">
        <h1 className="text-3xl font-bold mb-6">POS System</h1>
        <ProductGrid products={sampleProducts} onAddToCart={addToCart} />
      </div>
      <Cart
        items={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        onClearCart={clearCart}
      />
    </div>
  );
};

export default Index;