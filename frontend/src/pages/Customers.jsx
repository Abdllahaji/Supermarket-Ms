import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import SearchBar from '../components/common/SearchBar';
import Pagination from '../components/common/Pagination';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { HiPlus, HiPencil, HiTrash, HiEye } from 'react-icons/hi';
import toast from 'react-hot-toast';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const limit = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', address: ''
  });

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await API.get('/customers', {
        params: { page: currentPage, limit, search }
      });
      if (res.data.success) {
        setCustomers(res.data.data);
        setTotalPages(res.data.pagination.pages);
      }
    } catch (err) {
      toast.error('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [currentPage, search]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setFormData({ name: '', email: '', phone: '', address: '' });
    setCurrentCustomer(null);
    setIsModalOpen(true);
  };

  const openEditModal = (customer) => {
    setFormData({ 
      name: customer.name || '', 
      email: customer.email || '', 
      phone: customer.phone || '', 
      address: customer.address || '' 
    });
    setCurrentCustomer(customer);
    setIsModalOpen(true);
  };

  const openViewModal = (customer) => {
    setCurrentCustomer(customer);
    setIsViewModalOpen(true);
  };

  const openDeleteModal = (customer) => {
    setCurrentCustomer(customer);
    setIsDeleteModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (currentCustomer) {
        await API.put(`/customers/${currentCustomer._id}`, formData);
        toast.success('Customer updated successfully');
      } else {
        await API.post('/customers', formData);
        toast.success('Customer added successfully');
      }
      setIsModalOpen(false);
      fetchCustomers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save customer');
    }
  };

  const handleDelete = async () => {
    try {
      await API.delete(`/customers/${currentCustomer._id}`);
      toast.success('Customer deleted successfully');
      setIsDeleteModalOpen(false);
      fetchCustomers();
    } catch (err) {
      toast.error('Failed to delete customer');
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { 
      key: 'loyaltyPoints', 
      label: 'Loyalty Points',
      render: (item) => item.loyaltyPoints || 0
    },
    { 
      key: 'totalPurchases', 
      label: 'Total Purchases',
      render: (item) => `$${Number(item.totalPurchases || 0).toFixed(2)}`
    },
    { 
      key: 'createdAt', 
      label: 'Created Date',
      render: (item) => new Date(item.createdAt).toLocaleDateString()
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
        <h1 className="text-2xl font-bold text-gray-800">Customer Management</h1>
        <button 
          onClick={openAddModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center shadow-sm"
        >
          <HiPlus className="mr-2" /> Add Customer
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="mb-6 w-full md:w-1/3">
          <SearchBar value={search} onChange={setSearch} placeholder="Search by name, phone, email..." />
        </div>

        <DataTable 
          columns={columns} 
          data={customers} 
          loading={loading} 
          emptyMessage="No customers found." 
        />
        
        {totalPages > 1 && (
          <div className="mt-4">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentCustomer ? "Edit Customer" : "Add Customer"}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
            <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea name="address" value={formData.address} onChange={handleInputChange} rows="3" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"></textarea>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">Save</button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Customer Details">
        {currentCustomer && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><span className="text-gray-500 text-sm">Name:</span><p className="font-semibold">{currentCustomer.name}</p></div>
              <div><span className="text-gray-500 text-sm">Phone:</span><p className="font-semibold">{currentCustomer.phone}</p></div>
              <div><span className="text-gray-500 text-sm">Email:</span><p className="font-semibold">{currentCustomer.email || 'N/A'}</p></div>
              <div><span className="text-gray-500 text-sm">Loyalty Points:</span><p className="font-semibold">{currentCustomer.loyaltyPoints || 0}</p></div>
              <div><span className="text-gray-500 text-sm">Total Purchases:</span><p className="font-semibold">${Number(currentCustomer.totalPurchases || 0).toFixed(2)}</p></div>
              <div><span className="text-gray-500 text-sm">Created At:</span><p className="font-semibold">{new Date(currentCustomer.createdAt).toLocaleDateString()}</p></div>
            </div>
            <div>
              <span className="text-gray-500 text-sm">Address:</span>
              <p className="text-sm mt-1">{currentCustomer.address || 'N/A'}</p>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog 
        isOpen={isDeleteModalOpen} 
        title="Delete Customer" 
        message={`Are you sure you want to delete ${currentCustomer?.name}?`}
        onConfirm={handleDelete} 
        onCancel={() => setIsDeleteModalOpen(false)} 
      />
    </div>
  );
}
