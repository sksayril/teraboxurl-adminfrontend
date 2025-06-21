import React, { useState } from 'react';
import { Plus, X, Crown, Image as ImageIcon, Folder, ExternalLink } from 'lucide-react';
import { apiRequest } from '../utils/api';

interface PremiumBannerData {
  path: string;
  url: string;
  _id: string;
}

interface HomeData {
  thumbnailUrl: {
    path: string;
    url: string;
    _id: string;
  };
  premiumBannerUrls: PremiumBannerData[];
  searchableUrl: string;
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
  const [homeData, setHomeData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [bannerForm, setBannerForm] = useState({
    url: '',
    image: null as File | null
  });

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('/home');
      if (response.success && response.data) {
        setHomeData(response.data);
      }
    } catch (error) {
      console.error('Error fetching premium banners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerForm.image || !bannerForm.url) return;

    try {
      setIsCreating(true);
      const formData = new FormData();
      formData.append('url', bannerForm.url);
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
            url: '',
            image: null
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

      {/* Premium Banner URLs Section */}
      {homeData?.premiumBannerUrls && homeData.premiumBannerUrls.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4">
            <div className="flex items-center">
              <Crown className="w-6 h-6 text-white mr-3" />
              <h2 className="text-xl font-semibold text-white">Premium Banners</h2>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {homeData.premiumBannerUrls.map((banner, index) => (
                <div
                  key={banner._id}
                  className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300"
                >
                  <div className="aspect-[16/9] overflow-hidden bg-gray-100">
                    <img
                      src={banner.path}
                      alt={`Premium Banner ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4 space-y-3">
                    {/* Path Information */}
                    <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                      <Folder className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-purple-900 mb-1">Path</p>
                        <p className="text-sm text-purple-800 break-all">{banner.path}</p>
                      </div>
                    </div>
                    
                    {/* URL Information */}
                    <div className="flex items-start space-x-3 p-3 bg-pink-50 rounded-lg border-l-4 border-pink-500">
                      <ExternalLink className="w-5 h-5 text-pink-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-pink-900 mb-1">URL</p>
                        <a
                          href={banner.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-pink-800 hover:text-pink-600 underline break-all"
                        >
                          {banner.url}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-purple-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Premium Banners</h3>
          <p className="text-gray-500">There are currently no premium banners to display.</p>
        </div>
      )}

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
                  Banner URL
                </label>
                <input
                  type="url"
                  value={bannerForm.url}
                  onChange={(e) => setBannerForm(prev => ({ ...prev, url: e.target.value }))}
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
                  disabled={showSuccess || !bannerForm.image || !bannerForm.url || isCreating}
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
