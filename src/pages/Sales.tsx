import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Sale } from "@/types/pos";
import { subscribeToSales } from "@/services/saleService";
import { formatIDR } from "@/lib/currency";

const Sales = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [sales, setSales] = useState<Sale[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToSales((salesData) => {
      // Sort sales by date in descending order (newest first)
      const sortedSales = [...salesData].sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
      setSales(sortedSales);
    });

    return () => unsubscribe();
  }, []);

  const filteredSales = sales.filter((sale) => {
    const saleDate = new Date(sale.date);
    return (
      saleDate.getDate() === date.getDate() &&
      saleDate.getMonth() === date.getMonth() &&
      saleDate.getFullYear() === date.getFullYear()
    );
  });

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl font-bold mb-4 sm:mb-0">Riwayat Penjualan</h1>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : "Pilih tanggal"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => newDate && setDate(newDate)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {filteredSales.length > 0 ? (
        <div className="space-y-4">
          {filteredSales.map((sale) => (
            <div
              key={sale.id}
              className="bg-white p-4 rounded-lg shadow space-y-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(sale.date).toLocaleString("id-ID")}
                  </p>
                  <div className="mt-2 space-y-1">
                    {sale.items.map((item) => (
                      <div key={item.id} className="flex justify-between">
                        <span>{item.name} x {item.quantity}</span>
                        <span className="text-muted-foreground">
                          {formatIDR(item.regularPrice * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="pt-3 border-t">
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>{formatIDR(sale.total)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Dibayar</span>
                  <span>{formatIDR(sale.amountPaid)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Kembalian</span>
                  <span>{formatIDR(sale.change)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-muted-foreground">
          Tidak ada transaksi penjualan untuk ditampilkan.
        </div>
      )}
    </div>
  );
};

export default Sales;