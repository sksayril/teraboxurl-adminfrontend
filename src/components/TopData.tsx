import React, { useState, useEffect } from 'react';
import { Plus, X, TrendingUp, Edit, RefreshCw } from 'lucide-react';
import { apiRequest } from '../utils/api';

interface TopDataItem {
  _id: string;
  textdata: string;
  title: string;
  description: string;
  isActive: boolean;
  order: number;
  createdAt: string;
}

const LoadingSpinner = () => (
  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
      fill="none"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

const TopData: React.FC = () => {
  const [topDataItem, setTopDataItem] = useState<TopDataItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingItem, setEditingItem] = useState<TopDataItem | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    textdata: '',
    order: 1,
    isActive: true
  });

  const fetchTopData = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('/admin/get-top-data');
      if (response.success && response.data) {
        // Set the single top data item
        setTopDataItem(response.data);
      } else {
        // Set null if no data
        setTopDataItem(null);
      }
    } catch (error) {
      console.error('Error fetching top data:', error);
      // Set null on error
      setTopDataItem(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTopData = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.textdata) return;

    try {
      setIsCreating(true);
      const response = await apiRequest('/admin/create-top-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.success) {
        setShowSuccess(true);
        fetchTopData();
        setTimeout(() => {
          setShowSuccess(false);
          setShowCreateModal(false);
          setFormData({
            title: '',
            description: '',
            textdata: '',
            order: 1,
            isActive: true
          });
        }, 1500);
      }
    } catch (error) {
      console.error('Error creating top data:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditTopData = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !formData.title || !formData.textdata) return;

    try {
      setIsCreating(true);
      const response = await apiRequest(`/admin/top-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          _id: editingItem._id
        }),
      });

      if (response.success) {
        setShowSuccess(true);
        fetchTopData();
        setTimeout(() => {
          setShowSuccess(false);
          setEditingItem(null);
          setFormData({
            title: '',
            description: '',
            textdata: '',
            order: 1,
            isActive: true
          });
        }, 1500);
      }
    } catch (error) {
      console.error('Error updating top data:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteTopData = async (id: string) => {
    if (!confirm('Are you sure you want to delete this top data item?')) return;

    try {
      const response = await apiRequest(`/admin/delete-top-data/${id}`, {
        method: 'DELETE',
      });

      if (response.success) {
        fetchTopData();
      }
    } catch (error) {
      console.error('Error deleting top data:', error);
    }
  };

  const startEdit = (item: TopDataItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      textdata: item.textdata,
      order: item.order,
      isActive: item.isActive
    });
  };

  useEffect(() => {
    fetchTopData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Top Data Management</h1>
        <div className="flex space-x-3">
          <button
            onClick={fetchTopData}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors inline-flex items-center"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          {!topDataItem && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors inline-flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Top Data
            </button>
          )}
        </div>
      </div>

      {/* Top Data Display */}
      {topDataItem ? (
        <div className="grid grid-cols-1 gap-6">
          <div
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-3">
              <div className="flex items-center justify-between">
                <TrendingUp className="w-5 h-5 text-white" />
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  topDataItem.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {topDataItem.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2">{topDataItem.title}</h3>
              <p className="text-sm text-gray-600 mb-3">{topDataItem.description}</p>
              
              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                <p className="text-sm font-medium text-gray-700 mb-1">Text Data</p>
                <p className="text-sm font-bold text-sky-600 break-words">{topDataItem.textdata}</p>
              </div>

              <div className="bg-blue-50 rounded-lg p-3 mb-3">
                <p className="text-sm font-medium text-blue-700 mb-1">Order</p>
                <p className="text-sm font-bold text-blue-600">{topDataItem.order}</p>
              </div>

              <div className="bg-yellow-50 rounded-lg p-3 mb-3">
                <p className="text-sm font-medium text-yellow-700 mb-1">ID</p>
                <p className="text-xs text-yellow-600 break-all">{topDataItem._id}</p>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-500">
                  {new Date(topDataItem.createdAt).toLocaleDateString()}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => startEdit(topDataItem)}
                    className="p-1 text-gray-400 hover:text-sky-500 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : !loading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Top Data Found</h3>
          <p className="text-gray-500">
            Get started by creating your first top data item.
          </p>
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || editingItem) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                {editingItem ? 'Edit Top Data' : 'Add New Top Data'}
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingItem(null);
                  setFormData({
                    title: '',
                    description: '',
                    textdata: '',
                    order: 1,
                    isActive: true
                  });
                }}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={editingItem ? handleEditTopData : handleCreateTopData} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  placeholder="Enter title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  placeholder="Enter description"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text Data *
                </label>
                <textarea
                  value={formData.textdata}
                  onChange={(e) => setFormData(prev => ({ ...prev, textdata: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  placeholder="Enter text data (e.g., PUSHPA2 | RAGINIMMS | MSDHONI)"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 1 }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  placeholder="Enter order number"
                  min="1"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                  Active
                </label>
              </div>

              {showSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-green-700">
                    {editingItem ? 'Top data updated successfully!' : 'Top data created successfully!'}
                  </span>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingItem(null);
                    setFormData({
                      title: '',
                      description: '',
                      textdata: '',
                      order: 1,
                      isActive: true
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors flex items-center"
                  disabled={showSuccess || !formData.title || !formData.textdata || isCreating}
                >
                  {isCreating ? (
                    <>
                      <LoadingSpinner />
                      <span className="ml-2">{editingItem ? 'Updating...' : 'Creating...'}</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      {editingItem ? 'Update' : 'Create'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopData; 