import React, { useState } from 'react';
import { Plus, X, Crown, Image as ImageIcon } from 'lucide-react';
import { apiRequest } from '../utils/api';

interface PremiumBanner {
  bannerId: string;
  imageUrl: string;
  title: string;
  description: string;
  isActive: boolean;
  linkUrl: string;
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

const PremiumBanner: React.FC = () => {
  const [banners, setBanners] = useState<PremiumBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [bannerForm, setBannerForm] = useState({
    title: '',
    description: '',
    linkUrl: '',
    image: null as File | null,
    isActive: true
  });

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('/banners/premium');
      if (response.success && Array.isArray(response.data)) {
        setBanners(response.data);
      }
    } catch (error) {
      console.error('Error fetching premium banners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerForm.image) return;

    try {
      setIsCreating(true);
      const formData = new FormData();
      formData.append('title', bannerForm.title);
      formData.append('description', bannerForm.description);
      formData.append('linkUrl', bannerForm.linkUrl);
      formData.append('isActive', String(bannerForm.isActive));
      formData.append('image', bannerForm.image);

      const response = await apiRequest('/banners/premium', {
        method: 'POST',
        body: formData,
        headers: {}
      });

      if (response.success) {
        setShowSuccess(true);
        fetchBanners();
        setTimeout(() => {
          setShowSuccess(false);
          setShowCreateModal(false);
          setBannerForm({
            title: '',
            description: '',
            linkUrl: '',
            image: null,
            isActive: true
          });
          setPreviewUrl(null);
        }, 1500);
      }
    } catch (error) {
      console.error('Error creating premium banner:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setBannerForm(prev => ({ ...prev, image: file }));
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  React.useEffect(() => {
    fetchBanners();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Premium Banners</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors inline-flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Premium Banner
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="space-y-4">
          <div className="flex items-center mb-4">
            <Crown className="w-6 h-6 text-purple-400 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Premium Banners</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {banners.map((banner) => (
              <div
                key={banner.bannerId}
                className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden group"
              >
                <div className="aspect-[16/9] overflow-hidden bg-gray-100">
                  <img
                    src={banner.imageUrl}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900">{banner.title}</h3>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        banner.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {banner.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{banner.description}</p>
                  <a
                    href={banner.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-purple-600 hover:text-purple-800"
                  >
                    View Details →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create Premium Banner Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Add Premium Banner</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateBanner} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Banner Title
                </label>
                <input
                  type="text"
                  value={bannerForm.title}
                  onChange={(e) => setBannerForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={bannerForm.description}
                  onChange={(e) => setBannerForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link URL
                </label>
                <input
                  type="url"
                  value={bannerForm.linkUrl}
                  onChange={(e) => setBannerForm(prev => ({ ...prev, linkUrl: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  placeholder="https://"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Banner Image
                </label>
                <div className="relative border-2 border-dashed rounded-lg p-4 transition-colors hover:border-gray-400">
                  {previewUrl ? (
                    <div className="relative group">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full aspect-[16/9] object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewUrl(null);
                            setBannerForm(prev => ({ ...prev, image: null }));
                          }}
                          className="text-white hover:text-red-500 transition-colors"
                        >
                          <X className="w-8 h-8" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <input
                        type="file"
                        onChange={handleImageChange}
                        accept="image/*"
                        className="hidden"
                        id="premium-banner-image"
                        required
                      />
                      <label
                        htmlFor="premium-banner-image"
                        className="cursor-pointer inline-flex flex-col items-center"
                      >
                        <div className="p-3 bg-purple-100 rounded-lg text-purple-500 mb-3">
                          <Plus className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          Click to upload banner image
                        </span>
                        <span className="text-xs text-gray-500 mt-1">
                          Recommended: 1920x1080 px
                        </span>
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center bg-gray-50 p-4 rounded-lg">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={bannerForm.isActive}
                  onChange={(e) => setBannerForm(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded transition-colors"
                />
                <label htmlFor="isActive" className="ml-3">
                  <span className="text-sm font-medium text-gray-700">Active Banner</span>
                  <p className="text-xs text-gray-500">Banner will be displayed on the premium section</p>
                </label>
              </div>

              {showSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center animate-fade-in">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-green-700">Banner created successfully!</span>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center"
                  disabled={showSuccess || !bannerForm.image || isCreating}
                >
                  {isCreating ? (
                    <>
                      <LoadingSpinner />
                      <span className="ml-2">Creating...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Premium Banner
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

export default PremiumBanner;
