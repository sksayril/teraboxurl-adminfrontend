import React, { useState, useEffect } from 'react';
import { Plus, X, Link, Search, Edit, Trash2, ExternalLink, Copy, CheckCircle } from 'lucide-react';
import { apiRequest } from '../utils/api';

interface TeraLinkItem {
  id: string;
  url: string;
  createdAt: string;
  updatedAt: string;
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

const TeraLink: React.FC = () => {
  const [teraLink, setTeraLink] = useState<TeraLinkItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    url: ''
  });

  const fetchTeraLinks = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('/telegram-links/get');
      if (response.success && response.data) {
        setTeraLink(response.data);
      }
    } catch (error) {
      console.error('Error fetching tera links:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeraLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.url) return;

    try {
      setIsCreating(true);
      const response = await apiRequest('/telegram-links/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: formData.url
        }),
      });

      if (response.success) {
        setShowSuccess(true);
        fetchTeraLinks();
        setTimeout(() => {
          setShowSuccess(false);
          setShowCreateModal(false);
          setFormData({
            url: ''
          });
        }, 1500);
      }
    } catch (error) {
      console.error('Error creating tera link:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteTeraLink = async (id: string) => {
    if (!confirm('Are you sure you want to delete this TeraLink?')) return;

    try {
      const response = await apiRequest(`/telegram-links/delete/${id}`, {
        method: 'DELETE',
      });

      if (response.success) {
        fetchTeraLinks();
      }
    } catch (error) {
      console.error('Error deleting tera link:', error);
    }
  };

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };



  useEffect(() => {
    fetchTeraLinks();
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
        <h1 className="text-2xl font-bold text-gray-900">TeraLink Management</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors inline-flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add TeraLink
        </button>
      </div>

      {/* TeraLink Display */}
      {teraLink ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-3">
              <div className="flex items-center justify-between">
                <Link className="w-5 h-5 text-white" />
                <span className="text-white text-sm bg-white/20 px-2 py-1 rounded-full">
                  Telegram Link
                </span>
              </div>
            </div>
            
            <div className="p-4">
              <div className="mb-3">
                <h3 className="font-semibold text-gray-900 mb-2">Telegram URL</h3>
              </div>
              
              {/* Telegram URL */}
              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 mb-1">URL</p>
                    <a
                      href={teraLink.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-sky-600 hover:text-sky-500 flex items-center truncate"
                    >
                      <ExternalLink className="w-3 h-3 mr-1 flex-shrink-0" />
                      <span className="truncate">{teraLink.url}</span>
                    </a>
                  </div>
                  <button
                    onClick={() => handleCopyUrl(teraLink.url)}
                    className="ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {copiedUrl === teraLink.url ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* ID Display */}
              <div className="bg-blue-50 rounded-lg p-3 mb-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-blue-900 mb-1">ID</p>
                    <p className="text-sm text-blue-800 font-mono truncate">{teraLink.id}</p>
                  </div>
                  <button
                    onClick={() => handleCopyUrl(teraLink.id)}
                    className="ml-2 p-1 text-blue-400 hover:text-blue-600 transition-colors"
                  >
                    {copiedUrl === teraLink.id ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Timestamps */}
              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-medium text-gray-900 mb-1">Created</p>
                    <p className="text-xs text-gray-600">{new Date(teraLink.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-900 mb-1">Updated</p>
                    <p className="text-xs text-gray-600">{new Date(teraLink.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end items-center pt-3 border-t border-gray-100">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleDeleteTeraLink(teraLink.id)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Link className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No TeraLink Found</h3>
          <p className="text-gray-500">Get started by creating your first TeraLink.</p>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Add New TeraLink
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setFormData({
                    url: ''
                  });
                }}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateTeraLink} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telegram URL *
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  placeholder="https://t.me/mychannel"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the Telegram channel or group URL
                </p>
              </div>

              {showSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-green-700">
                    TeraLink created successfully!
                  </span>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormData({
                      url: ''
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors flex items-center"
                  disabled={showSuccess || !formData.url || isCreating}
                >
                  {isCreating ? (
                    <>
                      <LoadingSpinner />
                      <span className="ml-2">Creating...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Create
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

export default TeraLink; 