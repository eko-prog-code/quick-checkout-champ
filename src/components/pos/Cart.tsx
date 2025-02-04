import { useState } from "react";
import { CartItem, Sale } from "@/types/pos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus, Trash2, X, Printer } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { formatIDR } from "@/lib/currency";
import { createSale } from "@/services/saleService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
}

const Cart = ({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}: CartProps) => {
  const [amountPaid, setAmountPaid] = useState("");
  const [showReceipt, setShowReceipt] = useState(false);
  const { toast } = useToast();

  const subtotal = items.reduce(
    (sum, item) => sum + item.regularPrice * item.quantity,
    0
  );

  const handleQuantityChange = (productId: string, value: string) => {
    const quantity = parseInt(value);
    if (!isNaN(quantity) && quantity > 0) {
      onUpdateQuantity(productId, quantity);
    }
  };

  const handleNumberBlur = (value: string, setter: (value: string) => void) => {
    const number = parseFloat(value.replace(/[,.]/g, ''));
    if (!isNaN(number)) {
      setter(number.toLocaleString('id-ID'));
    }
  };

  const handlePrintReceipt = () => {
    const printContent = document.getElementById('receipt-content');
    if (printContent) {
      const originalContents = document.body.innerHTML;
      document.body.innerHTML = printContent.innerHTML;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload(); // Reload to restore React app state
    }
  };

  const handleCompleteSale = async () => {
    if (!amountPaid || parseFloat(amountPaid.replace(/[,.]/g, '')) < subtotal) {
      toast({
        title: "Jumlah pembayaran tidak valid",
        description: "Mohon masukkan jumlah pembayaran yang valid",
        variant: "destructive",
      });
      return;
    }

    const paidAmount = parseFloat(amountPaid.replace(/[,.]/g, ''));
    const change = paidAmount - subtotal;

    // Create sale record
    const saleData: Omit<Sale, 'id'> = {
      date: new Date().toISOString(),
      items: items,
      total: subtotal,
      amountPaid: paidAmount,
      change: change
    };

    try {
      await createSale(saleData);
      setShowReceipt(true);
      toast({
        title: "Transaksi berhasil!",
        description: `Kembalian: ${formatIDR(change)}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menyimpan transaksi",
        variant: "destructive",
      });
    }
  };

  const handleCloseReceipt = () => {
    setShowReceipt(false);
    onClearCart();
    setAmountPaid("");
  };

  return (
    <>
      <div className="w-full md:w-96 bg-white border-l shadow-lg flex flex-col slide-in">
        <div className="p-4 border-b flex justify-between items-center bg-primary text-primary-foreground">
          <h2 className="text-xl font-bold">Penjualan</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClearCart}
            className="hover:bg-primary/90"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between py-2 border-b"
            >
              <div className="flex-1">
                <h3 className="font-medium">{item.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {formatIDR(item.regularPrice)}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <Input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                  className="w-16 text-center"
                  min="1"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="destructive"
                  onClick={() => onRemoveItem(item.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t bg-muted">
          <div className="flex justify-between mb-4">
            <span className="font-bold">Total:</span>
            <span className="font-bold">{formatIDR(subtotal)}</span>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Jumlah Bayar
              </label>
              <Input
                type="text"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                onBlur={(e) => handleNumberBlur(e.target.value, setAmountPaid)}
                placeholder="Masukkan jumlah"
                className="w-full"
              />
            </div>
            {amountPaid && (
              <div className="flex justify-between text-sm">
                <span>Kembalian:</span>
                <span>
                  {formatIDR(Math.max(parseFloat(amountPaid.replace(/[,.]/g, '')) - subtotal, 0) || 0)}
                </span>
              </div>
            )}
            <Button
              className="w-full"
              size="lg"
              onClick={handleCompleteSale}
              disabled={items.length === 0}
            >
              Selesaikan Transaksi
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={showReceipt} onOpenChange={handleCloseReceipt}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>Struk Penjualan</span>
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrintReceipt}
                className="ml-2"
              >
                <Printer className="w-4 h-4" />
              </Button>
            </DialogTitle>
            <DialogDescription>
              {new Date().toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </DialogDescription>
          </DialogHeader>
          <div id="receipt-content" className="space-y-4">
            <div className="border-t border-b py-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between py-1">
                  <span>
                    {item.name} x {item.quantity}
                  </span>
                  <span>{formatIDR(item.regularPrice * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>{formatIDR(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Jumlah Bayar</span>
              <span>{formatIDR(parseFloat(amountPaid.replace(/[,.]/g, '')))}</span>
            </div>
            <div className="flex justify-between">
              <span>Kembalian</span>
              <span>
                {formatIDR(Math.max(parseFloat(amountPaid.replace(/[,.]/g, '')) - subtotal, 0) || 0)}
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Cart;