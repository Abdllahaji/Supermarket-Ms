import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import StatCard from '../components/common/StatCard';
import DataTable from '../components/common/DataTable';
import { 
  HiCollection, HiUsers, HiCash, HiTrendingUp, 
  HiUserGroup, HiExclamation, HiTag, HiCalendar 
} from 'react-icons/hi';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Mock data or actual API call depending on backend readiness
        // const response = await axios.get('/dashboard/stats');
        // setStats(response.data);
        
        // Simulating API response
        setTimeout(() => {
          setStats({
            totalProducts: 1250,
            totalCustomers: 850,
            totalSales: 4520,
            todayRevenue: 2450.50,
            activeCashiers: 12,
            lowStockItems: 18,
            activeDiscounts: 5,
            monthlyRevenue: 68500.00,
            revenueData: [
              { name: 'Jan', revenue: 4000 },
              { name: 'Feb', revenue: 3000 },
              { name: 'Mar', revenue: 2000 },
              { name: 'Apr', revenue: 2780 },
              { name: 'May', revenue: 1890 },
              { name: 'Jun', revenue: 2390 },
              { name: 'Jul', revenue: 3490 },
            ],
            recentSales: [
              { invoice: 'INV-001', cashier: 'John Doe', customer: 'Walk-in', total: 150.00, date: '2023-10-07' },
              { invoice: 'INV-002', cashier: 'Jane Smith', customer: 'Alice', total: 85.50, date: '2023-10-07' },
              { invoice: 'INV-003', cashier: 'John Doe', customer: 'Bob', total: 220.00, date: '2023-10-07' },
              { invoice: 'INV-004', cashier: 'Mike Johnson', customer: 'Walk-in', total: 45.00, date: '2023-10-07' },
              { invoice: 'INV-005', cashier: 'Jane Smith', customer: 'Walk-in', total: 310.20, date: '2023-10-07' },
            ],
            lowStockProducts: [
              { id: 1, name: 'Milk 1L', stock: 5, minStock: 10 },
              { id: 2, name: 'Bread', stock: 2, minStock: 15 },
              { id: 3, name: 'Eggs', stock: 8, minStock: 20 },
            ]
          });
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching dashboard stats', error);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading || !stats) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-gray-200 rounded-xl"></div>)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-gray-200 rounded-xl"></div>)}
        </div>
        <div className="h-96 bg-gray-200 rounded-xl"></div>
      </div>
    );
  }

  const recentSalesColumns = [
    { key: 'invoice', label: 'Invoice #' },
    { key: 'cashier', label: 'Cashier' },
    { key: 'customer', label: 'Customer' },
    { key: 'date', label: 'Date' },
    { key: 'total', label: 'Total', render: (val) => `$${val.toFixed(2)}` },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">Dashboard Overview</h2>
      
      {/* Top Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Products" value={stats.totalProducts} icon={<HiCollection />} color="bg-blue-500" />
        <StatCard title="Total Customers" value={stats.totalCustomers} icon={<HiUsers />} color="bg-green-500" />
        <StatCard title="Total Sales" value={stats.totalSales} icon={<HiCash />} color="bg-purple-500" />
        <StatCard title="Today's Revenue" value={`$${stats.todayRevenue.toFixed(2)}`} icon={<HiTrendingUp />} color="bg-amber-500" trend="+5.2%" />
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Active Cashiers" value={stats.activeCashiers} icon={<HiUserGroup />} color="bg-teal-500" />
        <StatCard title="Low Stock Items" value={stats.lowStockItems} icon={<HiExclamation />} color="bg-red-500" />
        <StatCard title="Active Discounts" value={stats.activeDiscounts} icon={<HiTag />} color="bg-pink-500" />
        <StatCard title="Monthly Revenue" value={`$${stats.monthlyRevenue.toFixed(2)}`} icon={<HiCalendar />} color="bg-emerald-500" trend="+12.5%" />
      </div>

      {/* Chart Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Revenue Overview</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} tickFormatter={(value) => `$${value}`} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                formatter={(value) => [`$${value}`, 'Revenue']}
              />
              <Area type="monotone" dataKey="revenue" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-medium text-gray-800">Recent Sales</h3>
          <DataTable columns={recentSalesColumns} data={stats.recentSales} loading={false} />
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-800">Low Stock Alerts</h3>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {stats.lowStockProducts.map(product => (
                <li key={product.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-500">Min Stock: {product.minStock}</p>
                  </div>
                  <div className="flex items-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {product.stock} left
                    </span>
                  </div>
                </li>
              ))}
              {stats.lowStockProducts.length === 0 && (
                <li className="p-4 text-center text-sm text-gray-500">No low stock alerts</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
