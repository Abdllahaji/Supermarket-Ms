import React, { useState, useEffect } from 'react';
import { HiOutlinePencilAlt, HiOutlineTrash, HiOutlinePlus } from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '../api/axios';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import Pagination from '../components/common/Pagination';
import ConfirmDialog from '../components/common/ConfirmDialog';
import SearchBar from '../components/common/SearchBar';

const Categories = [
  'Fruits & Vegetables', 'Dairy & Eggs', 'Meat & Seafood', 'Bakery', 'Beverages', 
  'Snacks', 'Canned Goods', 'Frozen Foods', 'Household', 'Personal Care', 'Other'
];

const Discounts = () => {
  const [discounts, setDiscounts] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ page: 1, limit: 10, search: '' });
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  
  const [modal, setModal] = useState({ isOpen: false, data: null });
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null });
  const [formData, setFormData] = useState({
    name: '', type: 'percentage', value: '', startDate: '', endDate: '', products: [], categories: [], minPurchase: '', status: 'active'
  });

  const fetchDiscounts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/discounts', { params: filters });
      if (data.success) {
        setDiscounts(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      toast.error('Failed to fetch discounts');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products?limit=100');
      if (data.success) setProducts(data.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, [filters]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenModal = (discount = null) => {
    if (discount) {
      setFormData({
        ...discount,
        startDate: new Date(discount.startDate).toISOString().split('T')[0],
        endDate: new Date(discount.endDate).toISOString().split('T')[0],
        products: discount.products?.map(p => p._id || p) || [],
      });
    } else {
      setFormData({ name: '', type: 'percentage', value: '', startDate: '', endDate: '', products: [], categories: [], minPurchase: '', status: 'active' });
    }
    setModal({ isOpen: true, data: discount });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (modal.data) {
        await api.put(`/discounts/${modal.data._id}`, formData);
        toast.success('Discount updated');
      } else {
        await api.post('/discounts', formData);
        toast.success('Discount created');
      }
      setModal({ isOpen: false, data: null });
      fetchDiscounts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save discount');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/discounts/${deleteDialog.id}`);
      toast.success('Discount deleted');
      setDeleteDialog({ isOpen: false, id: null });
      fetchDiscounts();
    } catch (error) {
      toast.error('Failed to delete discount');
    }
  };

  const getStatusBadge = (row) => {
    const now = new Date();
    const start = new Date(row.startDate);
    const end = new Date(row.endDate);
    
    if (row.status === 'inactive') return <span className="rounded-full px-2 py-1 text-xs font-semibold bg-red-100 text-red-800">Inactive</span>;
    if (end < now) return <span className="rounded-full px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-800">Expired</span>;
    if (start > now) return <span className="rounded-full px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800">Scheduled</span>;
    return <span className="rounded-full px-2 py-1 text-xs font-semibold bg-green-100 text-green-800">Active</span>;
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'type', label: 'Type', render: (val) => <span className="capitalize">{val}</span> },
    { key: 'value', label: 'Value', render: (val, row) => row.type === 'percentage' ? `${val}%` : `$${val.toFixed(2)}` },
    { key: 'startDate', label: 'Start Date', render: (val) => new Date(val).toLocaleDateString() },
    { key: 'endDate', label: 'End Date', render: (val) => new Date(val).toLocaleDateString() },
    { key: 'status', label: 'Status', render: (_, row) => getStatusBadge(row) },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex space-x-3">
          <button onClick={() => handleOpenModal(row)} className="text-indigo-600 hover:text-indigo-900"><HiOutlinePencilAlt className="w-5 h-5" /></button>
          <button onClick={() => setDeleteDialog({ isOpen: true, id: row._id })} className="text-red-600 hover:text-red-900"><HiOutlineTrash className="w-5 h-5" /></button>
        </div>
      )
    }
  ];

  const handleCategoryToggle = (category) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleProductToggle = (productId) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.includes(productId)
        ? prev.products.filter(p => p !== productId)
        : [...prev.products, productId]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Discount Management</h1>
        <button onClick={() => handleOpenModal()} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2 flex items-center space-x-2">
          <HiOutlinePlus className="w-5 h-5" />
          <span>Add Discount</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="mb-4 max-w-sm">
          <SearchBar value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })} placeholder="Search discounts..." />
        </div>
        
        <DataTable columns={columns} data={discounts} loading={loading} emptyMessage="No discounts found." />
        <Pagination currentPage={pagination.page} totalPages={pagination.pages} onPageChange={(page) => setFilters({ ...filters, page })} />
      </div>

      <Modal isOpen={modal.isOpen} onClose={() => setModal({ isOpen: false, data: null })} title={modal.data ? 'Edit Discount' : 'Add Discount'} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount Name *</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
              <select required value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500">
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Value * ({formData.type === 'percentage' ? '%' : '$'})</label>
              <input required type="number" step="0.01" min="0" value={formData.value} onChange={e => setFormData({...formData, value: parseFloat(e.target.value)})} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
              <input required type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
              <input required type="date" min={formData.startDate} value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Purchase Amount (Optional)</label>
              <input type="number" step="0.01" min="0" value={formData.minPurchase} onChange={e => setFormData({...formData, minPurchase: parseFloat(e.target.value)})} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500" placeholder="0.00" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Apply to Categories</label>
            <div className="flex flex-wrap gap-2">
              {Categories.map(cat => (
                <label key={cat} className="flex items-center space-x-2 text-sm bg-gray-50 border px-3 py-1 rounded-full cursor-pointer hover:bg-gray-100">
                  <input type="checkbox" checked={formData.categories.includes(cat)} onChange={() => handleCategoryToggle(cat)} className="rounded text-indigo-600 focus:ring-indigo-500" />
                  <span>{cat}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Apply to Specific Products</label>
            <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-2 space-y-1">
              {products.map(prod => (
                <label key={prod._id} className="flex items-center space-x-2 text-sm p-1 hover:bg-gray-50 rounded">
                  <input type="checkbox" checked={formData.products.includes(prod._id)} onChange={() => handleProductToggle(prod._id)} className="rounded text-indigo-600 focus:ring-indigo-500" />
                  <span>{prod.name} - ${prod.price}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button type="button" onClick={() => setModal({ isOpen: false, data: null })} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2">Save Discount</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog 
        isOpen={deleteDialog.isOpen} 
        title="Delete Discount" 
        message="Are you sure you want to delete this discount? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog({ isOpen: false, id: null })}
      />
    </div>
  );
};

export default Discounts;
