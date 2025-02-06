import { useState, useEffect } from "react";
import ProductGrid from "@/components/pos/ProductGrid";
import Cart from "@/components/pos/Cart";
import { CartItem, Product } from "@/types/pos";
import { useToast } from "@/components/ui/use-toast";
import { subscribeToProducts, updateProductStock } from "@/services/productService";

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Subscribe to produk secara realtime
    const unsubscribe = subscribeToProducts((updatedProducts) => {
      setProducts(updatedProducts);
    });
    return () => unsubscribe();
  }, []);

  const addToCart = async (product: Product) => {
    if (product.stock > 0) {
      try {
        // Kurangi stok produk sebanyak 1
        await updateProductStock(product.id, product.stock - 1);
        setCartItems((prev) => {
          const existingItem = prev.find((item) => item.id === product.id);
          if (existingItem) {
            return prev.map((item) =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            );
          }
          return [...prev, { ...product, quantity: 1 }];
        });
        toast({
          title: "Sukses",
          description: "Produk berhasil ditambahkan ke keranjang",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Gagal menambahkan produk ke keranjang",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Error",
        description: "Stok produk habis",
        variant: "destructive",
      });
    }
  };

  const updateQuantity = async (productId: string, newQuantity: number) => {
    const product = products.find((p) => p.id === productId);
    const cartItem = cartItems.find((item) => item.id === productId);
    if (!product || !cartItem) return;

    // Total stok awal = stok saat ini + jumlah yang sudah ada di keranjang
    const availableTotal = product.stock + cartItem.quantity;
    if (newQuantity > availableTotal) {
      toast({
        title: "Error",
        description: "Stok tidak mencukupi",
        variant: "destructive",
      });
      return;
    }

    const difference = newQuantity - cartItem.quantity; // selisih penambahan (positif) atau pengurangan (negatif)
    try {
      // Update stok produk berdasarkan selisih
      await updateProductStock(productId, product.stock - difference);
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === productId ? { ...item, quantity: newQuantity } : item
        )
      );
      toast({
        title: "Sukses",
        description: "Jumlah produk berhasil diperbarui",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memperbarui jumlah produk",
        variant: "destructive",
      });
    }
  };

  const removeFromCart = async (productId: string) => {
    const product = products.find((p) => p.id === productId);
    const cartItem = cartItems.find((item) => item.id === productId);
    if (product && cartItem) {
      try {
        // Kembalikan seluruh jumlah item di keranjang ke stok produk
        await updateProductStock(productId, product.stock + cartItem.quantity);
        setCartItems((prev) => prev.filter((item) => item.id !== productId));
        toast({
          title: "Sukses",
          description: "Produk berhasil dihapus dari keranjang",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Gagal menghapus produk dari keranjang",
          variant: "destructive",
        });
      }
    }
  };

  const clearCart = async () => {
    for (const item of cartItems) {
      const product = products.find((p) => p.id === item.id);
      if (product) {
        try {
          await updateProductStock(item.id, product.stock + item.quantity);
        } catch (error) {
          toast({
            title: "Error",
            description: `Gagal mengembalikan stok produk ${product.name}`,
            variant: "destructive",
          });
        }
      }
    }
    setCartItems([]);
    toast({
      title: "Sukses",
      description: "Keranjang berhasil dikosongkan",
    });
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 p-6 overflow-auto">
        <h1 className="text-3xl font-bold mb-6">POS System</h1>
        <ProductGrid products={products} onAddToCart={addToCart} showEditButton={false} />
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
