import React, { useState } from 'react';
import { Plus, X, Image as ImageIcon, ExternalLink, Search, Folder } from 'lucide-react';
import { apiRequest } from '../utils/api';

interface ThumbnailData {
  path: string;
  url: string;
  _id: string;
}

interface HomeData {
  thumbnailUrl: ThumbnailData;
  premiumBannerUrls: ThumbnailData[];
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

const HomeBanner: React.FC = () => {
  const [homeData, setHomeData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isCreatingPremium, setIsCreatingPremium] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [premiumPreviewUrl, setPremiumPreviewUrl] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPremiumRefreshing, setIsPremiumRefreshing] = useState(false);
  const [bannerForm, setBannerForm] = useState({
    linkUrl: '',
    searchableUrl: '',
    image: null as File | null,
    isActive: true
  });
  const [premiumBannerForm, setPremiumBannerForm] = useState({
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
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleHomeBannerClick = async () => {
    try {
      setIsRefreshing(true);
      const response = await apiRequest('/home');
      if (response.success && response.data) {
        setHomeData(response.data);
        // Show a brief success indicator
        setTimeout(() => setIsRefreshing(false), 500);
      }
    } catch (error) {
      console.error('Error fetching home banner data:', error);
      setIsRefreshing(false);
    }
  };

  const handlePremiumBannerClick = async () => {
    try {
      setIsPremiumRefreshing(true);
      const response = await apiRequest('/home');
      if (response.success && response.data) {
        setHomeData(response.data);
        // Show a brief success indicator
        setTimeout(() => setIsPremiumRefreshing(false), 500);
      }
    } catch (error) {
      console.error('Error fetching premium banner data:', error);
      setIsPremiumRefreshing(false);
    }
  };

  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerForm.image || !bannerForm.linkUrl || !bannerForm.searchableUrl) return;

    try {
      setIsCreating(true);
      const formData = new FormData();
      formData.append('url', bannerForm.linkUrl);
      formData.append('searchableUrl', bannerForm.searchableUrl);
      formData.append('isActive', String(bannerForm.isActive));
      formData.append('thumbnail', bannerForm.image);

      const response = await apiRequest('/home/thumbnail', {
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
            linkUrl: '',
            searchableUrl: '',
            image: null,
            isActive: true
          });
          setPreviewUrl(null);
        }, 1500);
      }
    } catch (error) {
      console.error('Error creating banner:', error);
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

  const handleCreatePremiumBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!premiumBannerForm.image || !premiumBannerForm.url) return;

    try {
      setIsCreatingPremium(true);
      const formData = new FormData();
      formData.append('url', premiumBannerForm.url);
      formData.append('image', premiumBannerForm.image);

      const response = await apiRequest('/banners/premium', {
        method: 'POST',
        body: formData,
        headers: {}
      });

      if (response.success) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          setShowPremiumModal(false);
          setPremiumBannerForm({
            url: '',
            image: null
          });
          setPremiumPreviewUrl(null);
        }, 1500);
      }
    } catch (error) {
      console.error('Error creating premium banner:', error);
    } finally {
      setIsCreatingPremium(false);
    }
  };

  const handlePremiumImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setPremiumBannerForm(prev => ({ ...prev, image: file }));
      const url = URL.createObjectURL(file);
      setPremiumPreviewUrl(url);
    }
  };

  React.useEffect(() => {
    fetchBanners();
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
        <h1 className="text-2xl font-bold text-gray-900">Home Banners</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors inline-flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Banner
          </button>
          {/* <button
            onClick={() => setShowPremiumModal(true)}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors inline-flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Premium Banner
          </button> */}
        </div>
      </div>

      {/* Thumbnail URL Section */}
      {homeData?.thumbnailUrl && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-4 cursor-pointer hover:from-sky-600 hover:to-blue-700 transition-all duration-300"
            onClick={handleHomeBannerClick}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ImageIcon className="w-6 h-6 text-white mr-3" />
                <h2 className="text-xl font-semibold text-white">Home Thumbnail</h2>
              </div>
              {isRefreshing ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              ) : (
                <div className="text-white text-sm bg-white/20 px-3 py-1 rounded-full hover:bg-white/30 transition-colors">
                  Click to Refresh
                </div>
              )}
            </div>
          </div>
          
          <div className="p-6">
            <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300">
              <div className="aspect-[16/9] overflow-hidden bg-gray-100">
                <img
                  src={homeData.thumbnailUrl.path}
                  alt="Home Thumbnail"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4 space-y-3">
                {/* Path Information */}
                <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <Folder className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-blue-900 mb-1">Path</p>
                    <p className="text-sm text-blue-800 break-all">{homeData.thumbnailUrl.path}</p>
                  </div>
                </div>
                
                {/* URL Information */}
                <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <ExternalLink className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-green-900 mb-1">URL</p>
                    <a
                      href={homeData.thumbnailUrl.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-green-800 hover:text-green-600 underline break-all"
                    >
                      {homeData.thumbnailUrl.url}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}



      {/* No Data Message */}
      {!homeData && !loading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Home Data Available</h3>
          <p className="text-gray-500">There are currently no thumbnails or banners to display.</p>
        </div>
      )}

      {/* Create Banner Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Add New Banner</h3>
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
                  <ExternalLink className="w-4 h-4 inline mr-2" />
                   URL
                </label>
                <input
                  type="url"
                  value={bannerForm.linkUrl}
                  onChange={(e) => setBannerForm(prev => ({ ...prev, linkUrl: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                  placeholder="https://example.com"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the URL where users will be redirected when clicking the banner
                </p>
                
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Searchable URL
                </label>
                <input
                  type="url"
                  value={bannerForm.searchableUrl}
                  onChange={(e) => setBannerForm(prev => ({ ...prev, searchableUrl: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                  placeholder="https://example.com"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the searchable URL for the banner
                </p>
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
                        id="banner-image"
                        required
                      />
                      <label
                        htmlFor="banner-image"
                        className="cursor-pointer inline-flex flex-col items-center"
                      >
                        <div className="p-3 bg-sky-100 rounded-lg text-sky-500 mb-3">
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
                  className="h-5 w-5 text-sky-600 focus:ring-sky-500 border-gray-300 rounded transition-colors"
                />
                <label htmlFor="isActive" className="ml-3">
                  <span className="text-sm font-medium text-gray-700">Active Banner</span>
                  <p className="text-xs text-gray-500">Banner will be displayed on the home page</p>
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
                  className="px-6 py-2.5 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors flex items-center"
                  disabled={showSuccess || !bannerForm.image || !bannerForm.linkUrl || !bannerForm.searchableUrl || isCreating}
                >
                  {isCreating ? (
                    <>
                      <LoadingSpinner />
                      <span className="ml-2">Creating...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Banner
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Premium Banner Modal */}
      {showPremiumModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Add Premium Banner</h3>
              <button
                onClick={() => setShowPremiumModal(false)}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreatePremiumBanner} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <ExternalLink className="w-4 h-4 inline mr-2" />
                  Premium Banner URL
                </label>
                <input
                  type="url"
                  value={premiumBannerForm.url}
                  onChange={(e) => setPremiumBannerForm(prev => ({ ...prev, url: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  placeholder="https://example.com"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the URL where users will be redirected when clicking the premium banner
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Premium Banner Image
                </label>
                <div className="relative border-2 border-dashed border-purple-300 rounded-lg p-4 transition-colors hover:border-purple-400">
                  {premiumPreviewUrl ? (
                    <div className="relative group">
                      <img
                        src={premiumPreviewUrl}
                        alt="Premium Banner Preview"
                        className="w-full aspect-[16/9] object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => {
                            setPremiumPreviewUrl(null);
                            setPremiumBannerForm(prev => ({ ...prev, image: null }));
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
                        onChange={handlePremiumImageChange}
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
                          Click to upload premium banner image
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
                  <span className="text-green-700">Premium banner created successfully!</span>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowPremiumModal(false)}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center"
                  disabled={showSuccess || !premiumBannerForm.image || !premiumBannerForm.url || isCreatingPremium}
                >
                  {isCreatingPremium ? (
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

export default HomeBanner;
