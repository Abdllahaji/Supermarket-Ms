import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import api from '../api/axios';
import DataTable from '../components/common/DataTable';
import LoadingSpinner from '../components/common/LoadingSpinner';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const Reports = () => {
  const [activeTab, setActiveTab] = useState('sales');
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const [salesData, setSalesData] = useState(null);
  const [productsData, setProductsData] = useState(null);
  const [customersData, setCustomersData] = useState(null);
  const [revenueData, setRevenueData] = useState(null);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'sales') {
        const { data } = await api.get('/reports/sales', { params: dateRange });
        if (data.success) setSalesData(data.data);
      } else if (activeTab === 'products') {
        const { data } = await api.get('/reports/products');
        if (data.success) setProductsData(data.data);
      } else if (activeTab === 'customers') {
        const { data } = await api.get('/reports/customers');
        if (data.success) setCustomersData(data.data);
      } else if (activeTab === 'revenue') {
        const { data } = await api.get('/reports/revenue', { params: dateRange });
        if (data.success) setRevenueData(data.data);
      }
    } catch (error) {
      console.error(`Failed to fetch ${activeTab} report`, error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [activeTab, dateRange]);

  const renderSalesTab = () => {
    if (!salesData) return <LoadingSpinner />;
    
    const paymentData = [
      { name: 'Cash', value: salesData.paymentMethodBreakdown?.cash || 0 },
      { name: 'Card', value: salesData.paymentMethodBreakdown?.card || 0 },
    ];

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500">Total Sales</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">{salesData.totalSales}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
            <p className="mt-2 text-3xl font-bold text-indigo-600">${(salesData.totalRevenue || 0).toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500">Average Transaction</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">${(salesData.averageTransaction || 0).toFixed(2)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 md:col-span-2">
            <h3 className="text-lg font-bold mb-4">Daily Sales Trend</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData.dailyBreakdown || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" orientation="left" stroke="#4F46E5" />
                  <YAxis yAxisId="right" orientation="right" stroke="#10B981" />
                  <RechartsTooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="count" name="Sales Count" fill="#4F46E5" />
                  <Bar yAxisId="right" dataKey="revenue" name="Revenue ($)" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-bold mb-4">Payment Methods</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={paymentData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {paymentData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderProductsTab = () => {
    if (!productsData) return <LoadingSpinner />;
    
    // sorting by stock
    const sortedProducts = [...productsData].sort((a, b) => a.stock - b.stock);

    const cols = [
      { key: 'name', label: 'Product Name' },
      { key: 'category', label: 'Category' },
      { key: 'stock', label: 'Stock Level', render: (val, row) => (
        <span className={val <= row.minStock ? 'text-red-600 font-bold' : 'text-green-600 font-bold'}>{val}</span>
      )},
      { key: 'minStock', label: 'Min Stock' },
      { key: 'price', label: 'Price', render: (val) => `$${(val || 0).toFixed(2)}` },
      { key: 'totalSold', label: 'Total Sold' },
      { key: 'totalRevenue', label: 'Total Revenue', render: (val) => `$${(val || 0).toFixed(2)}` }
    ];

    const lowStockCount = sortedProducts.filter(p => p.stock <= p.minStock).length;
    const totalValue = sortedProducts.reduce((sum, p) => sum + (p.stock * p.price), 0);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500">Total Products</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">{productsData.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500">Low Stock Alerts</h3>
            <p className="mt-2 text-3xl font-bold text-red-600">{lowStockCount}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500">Inventory Value</h3>
            <p className="mt-2 text-3xl font-bold text-indigo-600">${totalValue.toFixed(2)}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <DataTable columns={cols} data={sortedProducts} loading={false} emptyMessage="No products data." />
        </div>
      </div>
    );
  };

  const renderCustomersTab = () => {
    if (!customersData) return <LoadingSpinner />;
    
    const sorted = [...customersData].sort((a, b) => b.totalSpent - a.totalSpent);
    
    const cols = [
      { key: 'name', label: 'Customer Name' },
      { key: 'phone', label: 'Phone' },
      { key: 'saleCount', label: 'Purchases Count' },
      { key: 'loyaltyPoints', label: 'Loyalty Points' },
      { key: 'totalSpent', label: 'Total Spent', render: (val) => `$${(val || 0).toFixed(2)}` }
    ];

    const avgPurchase = sorted.length ? sorted.reduce((sum, c) => sum + (c.totalSpent || 0), 0) / sorted.length : 0;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500">Total Customers</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">{customersData.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500">Avg Customer Value</h3>
            <p className="mt-2 text-3xl font-bold text-indigo-600">${avgPurchase.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500">Top Customer</h3>
            <p className="mt-2 text-xl font-bold text-gray-900 truncate">{sorted[0]?.name || 'N/A'}</p>
            <p className="text-sm text-gray-500">${(sorted[0]?.totalSpent || 0).toFixed(2)}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <DataTable columns={cols} data={sorted} loading={false} emptyMessage="No customers data." />
        </div>
      </div>
    );
  };

  const renderRevenueTab = () => {
    if (!revenueData) return <LoadingSpinner />;
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
            <p className="mt-2 text-3xl font-bold text-indigo-600">${(revenueData.totalRevenue || 0).toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500">Average Daily Revenue</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">${(revenueData.averageDaily || 0).toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500">Best Day</h3>
            <p className="mt-2 text-xl font-bold text-gray-900">{revenueData.bestDay?.date || 'N/A'}</p>
            <p className="text-sm text-gray-500">${(revenueData.bestDay?.revenue || 0).toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-bold mb-4">Revenue Trend</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData.dailyBreakdown || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <RechartsTooltip />
                <Area type="monotone" dataKey="revenue" stroke="#4F46E5" fill="#4F46E5" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center space-y-4 md:space-y-0">
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        
        {(activeTab === 'sales' || activeTab === 'revenue') && (
          <div className="flex items-center space-x-2 bg-white rounded-lg p-2 shadow-sm border border-gray-100">
            <input type="date" value={dateRange.startDate} onChange={e => setDateRange({...dateRange, startDate: e.target.value})} className="border-none focus:ring-0 text-sm" />
            <span className="text-gray-400">-</span>
            <input type="date" value={dateRange.endDate} onChange={e => setDateRange({...dateRange, endDate: e.target.value})} className="border-none focus:ring-0 text-sm" />
          </div>
        )}
      </div>

      <div className="flex space-x-1 border-b border-gray-200">
        {['sales', 'products', 'customers', 'revenue'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm font-medium capitalize border-b-2 transition-colors ${activeTab === tab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            {tab} Report
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="mt-6">
          {activeTab === 'sales' && renderSalesTab()}
          {activeTab === 'products' && renderProductsTab()}
          {activeTab === 'customers' && renderCustomersTab()}
          {activeTab === 'revenue' && renderRevenueTab()}
        </div>
      )}
    </div>
  );
};

export default Reports;
