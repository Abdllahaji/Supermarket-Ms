import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import SearchBar from '../components/common/SearchBar';
import Pagination from '../components/common/Pagination';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { HiPlus, HiPencil, HiTrash } from 'react-icons/hi';
import toast from 'react-hot-toast';

export default function Cashiers() {
  const [cashiers, setCashiers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const limit = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [currentCashier, setCurrentCashier] = useState(null);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '', status: 'active'
  });

  const fetchCashiers = async () => {
    try {
      setLoading(true);
      const res = await API.get('/users', {
        params: { page: currentPage, limit, search, role: 'cashier' }
      });
      if (res.data.success) {
        setCashiers(res.data.data);
        setTotalPages(res.data.pagination.pages);
      }
    } catch (err) {
      toast.error('Failed to fetch cashiers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCashiers();
  }, [currentPage, search]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setFormData({ name: '', email: '', password: '', phone: '', status: 'active' });
    setCurrentCashier(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cashier) => {
    setFormData({ 
      name: cashier.name || '', 
      email: cashier.email || '', 
      password: '', // blank for edit
      phone: cashier.phone || '', 
      status: cashier.status || 'active'
    });
    setCurrentCashier(cashier);
    setIsModalOpen(true);
  };

  const openDeleteModal = (cashier) => {
    setCurrentCashier(cashier);
    setIsDeleteModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, role: 'cashier' };
      if (currentCashier) {
        // if password is empty on edit, delete it from payload
        if (!payload.password) delete payload.password;
        await API.put(`/users/${currentCashier._id}`, payload);
        toast.success('Cashier updated successfully');
      } else {
        await API.post('/users', payload);
        toast.success('Cashier added successfully');
      }
      setIsModalOpen(false);
      fetchCashiers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save cashier');
    }
  };

  const handleDelete = async () => {
    try {
      await API.delete(`/users/${currentCashier._id}`);
      toast.success('Cashier deleted successfully');
      setIsDeleteModalOpen(false);
      fetchCashiers();
    } catch (err) {
      toast.error('Failed to delete cashier');
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
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
      key: 'createdAt', 
      label: 'Created Date',
      render: (item) => new Date(item.createdAt).toLocaleDateString()
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (item) => (
        <div className="flex space-x-2">
          <button onClick={() => openEditModal(item)} className="p-1 text-gray-500 hover:text-blue-600"><HiPencil size={18} /></button>
          <button onClick={() => openDeleteModal(item)} className="p-1 text-gray-500 hover:text-red-600"><HiTrash size={18} /></button>
        </div>
      )
    }
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Cashier Management</h1>
        <button 
          onClick={openAddModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center shadow-sm"
        >
          <HiPlus className="mr-2" /> Add Cashier
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="mb-6 w-full md:w-1/3">
          <SearchBar value={search} onChange={setSearch} placeholder="Search cashiers..." />
        </div>

        <DataTable 
          columns={columns} 
          data={cashiers} 
          loading={loading} 
          emptyMessage="No cashiers found." 
        />
        
        {totalPages > 1 && (
          <div className="mt-4">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentCashier ? "Edit Cashier" : "Add Cashier"}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password {currentCashier ? '(Leave empty to keep unchanged)' : '*'}</label>
            <input type="password" name="password" value={formData.password} onChange={handleInputChange} required={!currentCashier} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select name="status" value={formData.status} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">Save</button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog 
        isOpen={isDeleteModalOpen} 
        title="Delete Cashier" 
        message={`Are you sure you want to delete ${currentCashier?.name}?`}
        onConfirm={handleDelete} 
        onCancel={() => setIsDeleteModalOpen(false)} 
      />
    </div>
  );
}
