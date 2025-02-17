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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const Analytics = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");

  useEffect(() => {
    const unsubscribe = subscribeToSales((salesData) => {
      setSales(salesData);
    });
    return () => unsubscribe();
  }, []);

  // Compute unique years from sales data for the year filter
  const years = Array.from(
    new Set(sales.map((sale) => new Date(sale.date).getFullYear()))
  ).sort((a, b) => a - b);

  // Filter sales based on the selected month and year for the chart
  const filteredSales = sales.filter((sale) => {
    const saleDate = new Date(sale.date);
    const saleMonth = saleDate.getMonth() + 1; // Month is zero-indexed
    const saleYear = saleDate.getFullYear();

    if (selectedMonth !== "all" && saleMonth !== parseInt(selectedMonth))
      return false;
    if (selectedYear !== "all" && saleYear !== parseInt(selectedYear))
      return false;
    return true;
  });

  // Group filtered sales by date for the chart
  const salesByDate = filteredSales.reduce(
    (acc: { [key: string]: number }, sale) => {
      const date = new Date(sale.date).toLocaleDateString();
      acc[date] = (acc[date] || 0) + sale.total;
      return acc;
    },
    {}
  );

  // Convert to array for chart data
  const chartData = Object.entries(salesByDate).map(([date, total]) => ({
    date,
    total,
  }));

  // Overall analytics (not filtered)
  // Group all sales by date for highest sales day
  const overallSalesByDate = sales.reduce(
    (acc: { [key: string]: number }, sale) => {
      const date = new Date(sale.date).toLocaleDateString();
      acc[date] = (acc[date] || 0) + sale.total;
      return acc;
    },
    {}
  );

  // Find the date with highest sales (overall)
  const highestSalesDay = Object.entries(overallSalesByDate).reduce(
    (max, [date, total]) => (total > max.total ? { date, total } : max),
    { date: "", total: 0 }
  );

  // Group all sales by hour for peak hour
  const salesByHour = sales.reduce((acc: { [key: string]: number }, sale) => {
    const hour = new Date(sale.date).getHours();
    acc[hour] = (acc[hour] || 0) + sale.total;
    return acc;
  }, {});

  // Find peak hour (overall)
  const peakHour = Object.entries(salesByHour).reduce(
    (max, [hour, total]) =>
      total > max.total ? { hour, total } : max,
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
            <div className="text-2xl font-bold">
              {formatIDR(highestSalesDay.total)}
            </div>
            <div className="text-sm text-muted-foreground">
              {highestSalesDay.date}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Peak Hours</CardTitle>
            <CardDescription>Time with the highest sales volume</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatIDR(peakHour.total)}
            </div>
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
          {/* Filters */}
          <div className="flex items-center space-x-4 mb-4">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="all">All Months</option>
              <option value="1">January</option>
              <option value="2">February</option>
              <option value="3">March</option>
              <option value="4">April</option>
              <option value="5">May</option>
              <option value="6">June</option>
              <option value="7">July</option>
              <option value="8">August</option>
              <option value="9">September</option>
              <option value="10">October</option>
              <option value="11">November</option>
              <option value="12">December</option>
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="all">All Years</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          {/* Chart */}
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value: number) => formatIDR(value)} />
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
