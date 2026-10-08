import React, { useState, useEffect } from 'react';
import { HiOutlinePencilAlt, HiOutlineTrash, HiOutlinePlus } from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import Pagination from '../components/common/Pagination';
import ConfirmDialog from '../components/common/ConfirmDialog';
import SearchBar from '../components/common/SearchBar';

const Users = () => {
  const { user } = useAuth();
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ page: 1, limit: 10, search: '', role: '', status: '' });
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  
  const [modal, setModal] = useState({ isOpen: false, data: null });
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null });
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'cashier', phone: '', status: 'active'
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users', { params: filters });
      if (data.success) {
        setUsersList(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const handleOpenModal = (userData = null) => {
    if (userData) {
      setFormData({ ...userData, password: '' });
    } else {
      setFormData({ name: '', email: '', password: '', role: 'cashier', phone: '', status: 'active' });
    }
    setModal({ isOpen: true, data: userData });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (modal.data && !payload.password) {
        delete payload.password; // optional on edit
      }
      
      if (modal.data) {
        await api.put(`/users/${modal.data._id}`, payload);
        toast.success('User updated');
      } else {
        await api.post('/users', payload);
        toast.success('User created');
      }
      setModal({ isOpen: false, data: null });
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save user');
    }
  };

  const handleDelete = async () => {
    if (deleteDialog.id === user._id) {
      toast.error('Cannot delete yourself');
      setDeleteDialog({ isOpen: false, id: null });
      return;
    }
    
    try {
      await api.delete(`/users/${deleteDialog.id}`);
      toast.success('User deleted');
      setDeleteDialog({ isOpen: false, id: null });
      fetchUsers();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const getRoleBadge = (role) => {
    const colors = {
      admin: 'bg-purple-100 text-purple-800',
      manager: 'bg-blue-100 text-blue-800',
      cashier: 'bg-green-100 text-green-800'
    };
    return <span className={`rounded-full px-2 py-1 text-xs font-semibold ${colors[role] || 'bg-gray-100 text-gray-800'}`}>{role}</span>;
  };

  const getStatusBadge = (status) => {
    return status === 'active' 
      ? <span className="rounded-full px-2 py-1 text-xs font-semibold bg-green-100 text-green-800">Active</span>
      : <span className="rounded-full px-2 py-1 text-xs font-semibold bg-red-100 text-red-800">Inactive</span>;
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'role', label: 'Role', render: (val) => getRoleBadge(val) },
    { key: 'status', label: 'Status', render: (val) => getStatusBadge(val) },
    { key: 'createdAt', label: 'Created Date', render: (val) => new Date(val).toLocaleDateString() },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex space-x-3">
          <button onClick={() => handleOpenModal(row)} className="text-indigo-600 hover:text-indigo-900"><HiOutlinePencilAlt className="w-5 h-5" /></button>
          {row._id !== user._id && (
            <button onClick={() => setDeleteDialog({ isOpen: true, id: row._id })} className="text-red-600 hover:text-red-900"><HiOutlineTrash className="w-5 h-5" /></button>
          )}
        </div>
      )
    }
  ];

  if (user?.role !== 'admin') {
    return <div className="p-6 text-center text-red-600 font-bold text-xl">Access Denied. Admins only.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <button onClick={() => handleOpenModal()} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2 flex items-center space-x-2">
          <HiOutlinePlus className="w-5 h-5" />
          <span>Add User</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 space-y-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <SearchBar value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })} placeholder="Search users..." />
          </div>
          <select value={filters.role} onChange={(e) => setFilters({ ...filters, role: e.target.value, page: 1 })} className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500">
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="cashier">Cashier</option>
          </select>
          <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })} className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500">
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        
        <DataTable columns={columns} data={usersList} loading={loading} emptyMessage="No users found." />
        <Pagination currentPage={pagination.page} totalPages={pagination.pages} onPageChange={(page) => setFilters({ ...filters, page })} />
      </div>

      <Modal isOpen={modal.isOpen} onClose={() => setModal({ isOpen: false, data: null })} title={modal.data ? 'Edit User' : 'Add User'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password {modal.data && '(Leave empty to keep current)'}</label>
            <input required={!modal.data} type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
              <select required value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500">
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="cashier">Cashier</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button type="button" onClick={() => setModal({ isOpen: false, data: null })} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2">Save User</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog 
        isOpen={deleteDialog.isOpen} 
        title="Delete User" 
        message="Are you sure you want to delete this user?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog({ isOpen: false, id: null })}
      />
    </div>
  );
};

export default Users;
