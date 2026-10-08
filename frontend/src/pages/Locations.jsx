import React, { useState, useEffect } from 'react';
import { HiOutlinePencilAlt, HiOutlineTrash, HiOutlinePlus } from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '../api/axios';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import Pagination from '../components/common/Pagination';
import ConfirmDialog from '../components/common/ConfirmDialog';
import SearchBar from '../components/common/SearchBar';

const Locations = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ page: 1, limit: 10, search: '' });
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  
  const [modal, setModal] = useState({ isOpen: false, data: null });
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null });
  const [formData, setFormData] = useState({
    branch: '', section: '', shelf: '', aisle: '', description: ''
  });

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/locations', { params: filters });
      if (data.success) {
        setLocations(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      toast.error('Failed to fetch locations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, [filters]);

  const handleOpenModal = (location = null) => {
    if (location) {
      setFormData({ ...location });
    } else {
      setFormData({ branch: '', section: '', shelf: '', aisle: '', description: '' });
    }
    setModal({ isOpen: true, data: location });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (modal.data) {
        await api.put(`/locations/${modal.data._id}`, formData);
        toast.success('Location updated');
      } else {
        await api.post('/locations', formData);
        toast.success('Location created');
      }
      setModal({ isOpen: false, data: null });
      fetchLocations();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save location');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/locations/${deleteDialog.id}`);
      toast.success('Location deleted');
      setDeleteDialog({ isOpen: false, id: null });
      fetchLocations();
    } catch (error) {
      toast.error('Failed to delete location');
    }
  };

  const columns = [
    { key: 'branch', label: 'Branch' },
    { key: 'section', label: 'Section' },
    { key: 'shelf', label: 'Shelf' },
    { key: 'aisle', label: 'Aisle' },
    { key: 'description', label: 'Description' },
    { key: 'createdAt', label: 'Created Date', render: (val) => new Date(val).toLocaleDateString() },
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Location Management</h1>
        <button onClick={() => handleOpenModal()} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2 flex items-center space-x-2">
          <HiOutlinePlus className="w-5 h-5" />
          <span>Add Location</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="mb-4 max-w-sm">
          <SearchBar value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })} placeholder="Search by branch or section..." />
        </div>
        
        <DataTable columns={columns} data={locations} loading={loading} emptyMessage="No locations found." />
        <Pagination currentPage={pagination.page} totalPages={pagination.pages} onPageChange={(page) => setFilters({ ...filters, page })} />
      </div>

      <Modal isOpen={modal.isOpen} onClose={() => setModal({ isOpen: false, data: null })} title={modal.data ? 'Edit Location' : 'Add Location'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Branch *</label>
            <input required type="text" value={formData.branch} onChange={e => setFormData({...formData, branch: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Section *</label>
            <input required type="text" value={formData.section} onChange={e => setFormData({...formData, section: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shelf</label>
              <input type="text" value={formData.shelf} onChange={e => setFormData({...formData, shelf: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Aisle</label>
              <input type="text" value={formData.aisle} onChange={e => setFormData({...formData, aisle: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows="3" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"></textarea>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button type="button" onClick={() => setModal({ isOpen: false, data: null })} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2">Save</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog 
        isOpen={deleteDialog.isOpen} 
        title="Delete Location" 
        message="Are you sure you want to delete this location?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog({ isOpen: false, id: null })}
      />
    </div>
  );
};

export default Locations;
