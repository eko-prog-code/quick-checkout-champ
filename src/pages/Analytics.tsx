
import { useState, useEffect } from "react";
import { subscribeToSales } from "@/services/saleService";
import { Sale } from "@/types/pos";
import { formatIDR } from "@/lib/currency";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Analytics = () => {
  const [sales, setSales] = useState<Sale[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToSales((salesData) => {
      setSales(salesData);
    });

    return () => unsubscribe();
  }, []);

  // Group sales by date
  const salesByDate = sales.reduce((acc: { [key: string]: number }, sale) => {
    const date = new Date(sale.date).toLocaleDateString();
    acc[date] = (acc[date] || 0) + sale.total;
    return acc;
  }, {});

  // Convert to array for chart data
  const chartData = Object.entries(salesByDate).map(([date, total]) => ({
    date,
    total,
  }));

  // Find the date with highest sales
  const highestSalesDay = Object.entries(salesByDate).reduce(
    (max, [date, total]) => (total > max.total ? { date, total } : max),
    { date: "", total: 0 }
  );

  // Group sales by hour
  const salesByHour = sales.reduce((acc: { [key: string]: number }, sale) => {
    const hour = new Date(sale.date).getHours();
    acc[hour] = (acc[hour] || 0) + sale.total;
    return acc;
  }, {});

  // Find peak hours
  const peakHour = Object.entries(salesByHour).reduce(
    (max, [hour, total]) => (total > max.total ? { hour, total } : max),
    { hour: "", total: 0 }
  );

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Analytics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Highest Sales Day</CardTitle>
            <CardDescription>Date with the highest total sales</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatIDR(highestSalesDay.total)}</div>
            <div className="text-sm text-muted-foreground">{highestSalesDay.date}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Peak Hours</CardTitle>
            <CardDescription>Time with the highest sales volume</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatIDR(peakHour.total)}</div>
            <div className="text-sm text-muted-foreground">
              {peakHour.hour}:00 - {Number(peakHour.hour) + 1}:00
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily Sales Trend</CardTitle>
          <CardDescription>Sales volume by date</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => formatIDR(value)}
                />
                <Bar dataKey="total" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
