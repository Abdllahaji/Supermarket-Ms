import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import SearchBar from '../components/common/SearchBar';
import Pagination from '../components/common/Pagination';
import ConfirmDialog from '../components/common/ConfirmDialog';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { HiPlus, HiPencil, HiTrash, HiEye } from 'react-icons/hi';
import toast from 'react-hot-toast';

const CATEGORIES = ['Fruits & Vegetables', 'Dairy & Eggs', 'Meat & Seafood', 'Bakery', 'Beverages', 'Snacks', 'Canned Goods', 'Frozen Foods', 'Household', 'Personal Care', 'Other'];

export default function Products() {
  const { user, token } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState([]);
  
  // Pagination & Filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const limit = 10;

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Active Data
  const [currentProduct, setCurrentProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '', barcode: '', category: '', description: '', 
    quantity: 0, minStock: 0, price: 0, costPrice: 0, 
    location: '', status: 'active'
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await API.get('/products', {
        params: { page: currentPage, limit, search, category, status }
      });
      if (res.data.success) {
        setProducts(res.data.data);
        setTotalPages(res.data.pagination.pages);
      }
    } catch (err) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const res = await API.get('/locations');
      if (res.data.success) {
        setLocations(res.data.data);
      }
    } catch (err) {
      // Locations might not be implemented, fallback quietly
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage, search, category, status]);

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setFormData({
      name: '', barcode: '', category: '', description: '', 
      quantity: 0, minStock: 0, price: 0, costPrice: 0, 
      location: '', status: 'active'
    });
    setCurrentProduct(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setFormData({ ...product });
    setCurrentProduct(product);
    setIsModalOpen(true);
  };

  const openViewModal = (product) => {
    setCurrentProduct(product);
    setIsViewModalOpen(true);
  };

  const openDeleteModal = (product) => {
    setCurrentProduct(product);
    setIsDeleteModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (currentProduct) {
        await API.put(`/products/${currentProduct._id}`, formData);
        toast.success('Product updated successfully');
      } else {
        await API.post('/products', formData);
        toast.success('Product added successfully');
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    }
  };

  const handleDelete = async () => {
    try {
      await API.delete(`/products/${currentProduct._id}`);
      toast.success('Product deleted successfully');
      setIsDeleteModalOpen(false);
      fetchProducts();
    } catch (err) {
      toast.error('Failed to delete product');
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'barcode', label: 'Barcode' },
    { 
      key: 'category', 
      label: 'Category',
      render: (item) => <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-semibold">{item.category}</span>
    },
    { 
      key: 'price', 
      label: 'Price',
      render: (item) => `$${Number(item.price).toFixed(2)}`
    },
    { 
      key: 'quantity', 
      label: 'Stock',
      render: (item) => (
        <span className={item.quantity <= item.minStock ? 'text-red-600 font-bold' : ''}>
          {item.quantity}
        </span>
      )
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (item) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {item.status}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (item) => (
        <div className="flex space-x-2">
          <button onClick={() => openViewModal(item)} className="p-1 text-gray-500 hover:text-indigo-600"><HiEye size={18} /></button>
          <button onClick={() => openEditModal(item)} className="p-1 text-gray-500 hover:text-blue-600"><HiPencil size={18} /></button>
          <button onClick={() => openDeleteModal(item)} className="p-1 text-gray-500 hover:text-red-600"><HiTrash size={18} /></button>
        </div>
      )
    }
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Product Management</h1>
        <button 
          onClick={openAddModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center shadow-sm"
        >
          <HiPlus className="mr-2" /> Add Product
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <SearchBar value={search} onChange={setSearch} placeholder="Search by name or barcode..." />
          </div>
          <select 
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select 
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <DataTable 
          columns={columns} 
          data={products} 
          loading={loading} 
          emptyMessage="No products found." 
        />
        
        {totalPages > 1 && (
          <div className="mt-4">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentProduct ? "Edit Product" : "Add Product"} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Barcode *</label>
              <input type="text" name="barcode" value={formData.barcode} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select name="category" value={formData.category} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500">
                <option value="">Select Category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              {locations.length > 0 ? (
                <select name="location" value={formData.location} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500">
                  <option value="">Select Location</option>
                  {locations.map(loc => <option key={loc._id} value={loc._id}>{loc.name}</option>)}
                </select>
              ) : (
                <input type="text" name="location" value={formData.location} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500" placeholder="Aisle/Shelf" />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cost Price *</label>
              <input type="number" step="0.01" name="costPrice" value={formData.costPrice} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price *</label>
              <input type="number" step="0.01" name="price" value={formData.price} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Stock</label>
              <input type="number" name="minStock" value={formData.minStock} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select name="status" value={formData.status} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"></textarea>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">Save</button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Product Details">
        {currentProduct && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><span className="text-gray-500 text-sm">Name:</span><p className="font-semibold">{currentProduct.name}</p></div>
              <div><span className="text-gray-500 text-sm">Barcode:</span><p className="font-semibold">{currentProduct.barcode}</p></div>
              <div><span className="text-gray-500 text-sm">Category:</span><p className="font-semibold">{currentProduct.category}</p></div>
              <div><span className="text-gray-500 text-sm">Location:</span><p className="font-semibold">{currentProduct.location}</p></div>
              <div><span className="text-gray-500 text-sm">Cost Price:</span><p className="font-semibold">${currentProduct.costPrice}</p></div>
              <div><span className="text-gray-500 text-sm">Selling Price:</span><p className="font-semibold">${currentProduct.price}</p></div>
              <div><span className="text-gray-500 text-sm">Quantity:</span><p className="font-semibold">{currentProduct.quantity}</p></div>
              <div><span className="text-gray-500 text-sm">Min Stock:</span><p className="font-semibold">{currentProduct.minStock}</p></div>
            </div>
            <div>
              <span className="text-gray-500 text-sm">Description:</span>
              <p className="text-sm mt-1">{currentProduct.description || 'No description available.'}</p>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog 
        isOpen={isDeleteModalOpen} 
        title="Delete Product" 
        message={`Are you sure you want to delete ${currentProduct?.name}? This action cannot be undone.`}
        onConfirm={handleDelete} 
        onCancel={() => setIsDeleteModalOpen(false)} 
      />
    </div>
  );
}
