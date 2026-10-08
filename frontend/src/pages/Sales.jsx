import React, { useState, useEffect } from 'react';
import { HiOutlineEye, HiOutlinePrinter, HiOutlineSearch, HiOutlineCalendar } from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '../api/axios';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import Pagination from '../components/common/Pagination';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [dailyStats, setDailyStats] = useState({ count: 0, totalRevenue: 0, averageTransaction: 0 });
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [filters, setFilters] = useState({ page: 1, limit: 10, search: '', startDate: '', endDate: '', paymentMethod: '' });
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [viewModal, setViewModal] = useState({ isOpen: false, sale: null });

  const fetchSales = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/sales', { params: filters });
      if (data.success) {
        setSales(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      toast.error('Failed to fetch sales');
    } finally {
      setLoading(false);
    }
  };

  const fetchDailyStats = async () => {
    try {
      const { data } = await api.get('/sales/daily');
      if (data.success) {
        setDailyStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch daily stats');
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [filters]);

  useEffect(() => {
    fetchDailyStats();
  }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value, page: 1 });
  };

  const viewInvoice = async (id) => {
    try {
      const { data } = await api.get(`/sales/${id}`);
      if (data.success) {
        setViewModal({ isOpen: true, sale: data.data });
      }
    } catch (error) {
      toast.error('Failed to load invoice details');
    }
  };

  const columns = [
    { key: 'invoiceNumber', label: 'Invoice #' },
    { key: 'cashier', label: 'Cashier', render: (val) => val?.name || 'Unknown' },
    { key: 'customer', label: 'Customer', render: (val) => val?.name || 'Walk-in' },
    { key: 'itemsCount', label: 'Items', render: (_, row) => row.items?.length || 0 },
    { key: 'subtotal', label: 'Subtotal', render: (val, row) => `$${(row.subtotal || 0).toFixed(2)}` },
    { key: 'discount', label: 'Discount', render: (val, row) => `$${(row.discountAmount ?? row.discount ?? 0).toFixed(2)}` },
    { key: 'total', label: 'Total', render: (val, row) => `$${(row.totalAmount ?? row.total ?? 0).toFixed(2)}` },
    { 
      key: 'paymentMethod', 
      label: 'Payment', 
      render: (val, row) => {
        const method = row.paymentMethod || 'cash';
        return (
          <span className={`rounded-full px-2 py-1 text-xs font-semibold ${method === 'card' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
            {method.toUpperCase()}
          </span>
        );
      }
    },
    { key: 'createdAt', label: 'Date', render: (val, row) => new Date(row.createdAt).toLocaleString() },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <button onClick={() => viewInvoice(row._id)} className="text-indigo-600 hover:text-indigo-900" title="View Invoice">
          <HiOutlineEye className="w-5 h-5" />
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Sales Management</h1>
      </div>

      {!statsLoading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500">Total Sales Today</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">{dailyStats.count}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500">Today's Revenue</h3>
            <p className="mt-2 text-3xl font-bold text-indigo-600">${(dailyStats.totalRevenue || 0).toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500">Average Transaction</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">${(dailyStats.averageTransaction || 0).toFixed(2)}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 space-y-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px] relative">
            <HiOutlineSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              name="search"
              placeholder="Search by invoice number..."
              value={filters.search}
              onChange={handleFilterChange}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex items-center space-x-2">
            <HiOutlineCalendar className="text-gray-400" />
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
            />
            <span>-</span>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            name="paymentMethod"
            value={filters.paymentMethod}
            onChange={handleFilterChange}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Payments</option>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
          </select>
        </div>

        <DataTable columns={columns} data={sales} loading={loading} emptyMessage="No sales found." />
        <Pagination currentPage={pagination.page} totalPages={pagination.pages} onPageChange={(page) => setFilters({ ...filters, page })} />
      </div>

      <Modal isOpen={viewModal.isOpen} onClose={() => setViewModal({ isOpen: false, sale: null })} title="Invoice Details" size="lg">
        {viewModal.sale ? (
          <div className="space-y-6 print:p-0 p-4">
            <div className="text-center border-b pb-4">
              <h2 className="text-2xl font-bold">SUPERMARKET MS</h2>
              <p className="text-gray-500">Invoice #: {viewModal.sale.invoiceNumber}</p>
              <p className="text-gray-500">Date: {new Date(viewModal.sale.createdAt).toLocaleString()}</p>
            </div>
            
            <div className="flex justify-between text-sm">
              <div>
                <p><strong>Cashier:</strong> {viewModal.sale.cashier?.name}</p>
              </div>
              <div>
                <p><strong>Customer:</strong> {viewModal.sale.customer?.name || 'Walk-in'}</p>
              </div>
            </div>

            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-t">
                <tr>
                  <th className="py-2">Item</th>
                  <th className="py-2">Qty</th>
                  <th className="py-2">Price</th>
                  <th className="py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {viewModal.sale.items?.map((item, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="py-2">{item.productName || item.product?.name || 'Unknown Item'}</td>
                    <td className="py-2">{item.quantity}</td>
                    <td className="py-2">${(item.price || 0).toFixed(2)}</td>
                    <td className="py-2 text-right">${(item.subtotal || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end border-t pt-4">
              <div className="w-64 space-y-2 text-sm">
                <div className="flex justify-between"><span>Subtotal:</span> <span>${(viewModal.sale.subtotal || 0).toFixed(2)}</span></div>
                <div className="flex justify-between text-red-600"><span>Discount:</span> <span>-${(viewModal.sale.discountAmount ?? viewModal.sale.discount ?? 0).toFixed(2)}</span></div>
                {viewModal.sale.taxAmount > 0 && <div className="flex justify-between"><span>Tax:</span> <span>+${(viewModal.sale.taxAmount || 0).toFixed(2)}</span></div>}
                <div className="flex justify-between font-bold text-lg pt-2 border-t"><span>Total:</span> <span>${(viewModal.sale.totalAmount ?? viewModal.sale.total ?? 0).toFixed(2)}</span></div>
                <div className="flex justify-between pt-2"><span>Payment ({viewModal.sale.paymentMethod}):</span> <span>${(viewModal.sale.amountPaid ?? viewModal.sale.totalAmount ?? 0).toFixed(2)}</span></div>
                {(viewModal.sale.change > 0) && <div className="flex justify-between font-semibold text-green-600"><span>Change:</span> <span>${(viewModal.sale.change || 0).toFixed(2)}</span></div>}
              </div>
            </div>

            <div className="flex justify-end pt-4 print:hidden">
              <button onClick={() => window.print()} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2 flex items-center space-x-2">
                <HiOutlinePrinter className="w-5 h-5" />
                <span>Print Receipt</span>
              </button>
            </div>
          </div>
        ) : (
          <LoadingSpinner />
        )}
      </Modal>
    </div>
  );
};

export default Sales;
