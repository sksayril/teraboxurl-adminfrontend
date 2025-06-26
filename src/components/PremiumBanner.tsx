import React, { useState } from 'react';
import { Plus, X, Crown, Image as ImageIcon, Folder, ExternalLink, Trash2 } from 'lucide-react';
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [selectedBannerIndex, setSelectedBannerIndex] = useState<number | null>(null);
  const [bannerForm, setBannerForm] = useState({
    urls: [''],
    images: [] as File[]
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
    if (bannerForm.images.length === 0) return;

    try {
      setIsCreating(true);
      const formData = new FormData();
      
      // Add each image with the field name 'banners'
      bannerForm.images.forEach((image) => {
        formData.append('banners', image);
      });
      
      // Add URLs array
      bannerForm.urls.forEach((url, index) => {
        formData.append('urls', url || 'http://');
      });

      const response = await apiRequest('/home/premium-banner', {
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
            urls: [''],
            images: []
          });
          setPreviewUrls([]);
        }, 1500);
      }
    } catch (error) {
      console.error('Error creating premium banner:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setBannerForm(prev => ({ 
        ...prev, 
        images: [...prev.images, ...files],
        urls: [...prev.urls, ...Array(files.length).fill('')]
      }));
      
      // Show previews of all images
      const newPreviewUrls = files.map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    }
  };

  const addUrlField = () => {
    setBannerForm(prev => ({
      ...prev,
      urls: [...prev.urls, '']
    }));
  };

  const removeUrlField = (index: number) => {
    setBannerForm(prev => ({
      ...prev,
      urls: prev.urls.filter((_, i) => i !== index),
      images: prev.images.filter((_, i) => i !== index)
    }));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const updateUrl = (index: number, value: string) => {
    setBannerForm(prev => ({
      ...prev,
      urls: prev.urls.map((url, i) => i === index ? value : url)
    }));
  };

  const handleDeleteBanner = (bannerIndex: number) => {
    setSelectedBannerIndex(bannerIndex);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedBannerIndex === null) return;

    try {
      setIsDeleting(true);
      const response = await apiRequest('/home/delete-premium-banner', {
        method: 'POST',
        body: JSON.stringify({ bannerIndex: selectedBannerIndex }),
      });

      if (response.success) {
        setShowSuccess(true);
        fetchBanners(); // Refresh the data
        setTimeout(() => {
          setShowSuccess(false);
          setShowDeleteModal(false);
          setSelectedBannerIndex(null);
        }, 1500);
      }
    } catch (error) {
      console.error('Error deleting premium banner:', error);
    } finally {
      setIsDeleting(false);
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
                  className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 relative group"
                >
                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteBanner(index)}
                    className="absolute top-3 right-3 z-10 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg"
                    title="Delete banner"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

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
                  Banner URLs & Images
                </label>
                <div className="space-y-4">
                  {bannerForm.urls.map((url, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-gray-700">Banner {index + 1}</h4>
                        {bannerForm.urls.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeUrlField(index)}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Remove banner"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            URL
                          </label>
                          <input
                            type="url"
                            value={url}
                            onChange={(e) => updateUrl(index, e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            placeholder="https://"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Image
                          </label>
                          <div className="relative">
                            {previewUrls[index] ? (
                              <div className="relative group">
                                <img
                                  src={previewUrls[index]}
                                  alt={`Preview ${index + 1}`}
                                  className="w-full h-20 object-cover rounded-md"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newPreviewUrls = [...previewUrls];
                                      newPreviewUrls[index] = '';
                                      setPreviewUrls(newPreviewUrls);
                                      const newImages = [...bannerForm.images];
                                      newImages[index] = null as any;
                                      setBannerForm(prev => ({ ...prev, images: newImages }));
                                    }}
                                    className="text-white hover:text-red-500 transition-colors"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="w-full h-20 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center bg-white">
                                <span className="text-xs text-gray-500">No image selected</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={addUrlField}
                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Another Banner
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Images
                </label>
                <div className="relative border-2 border-dashed rounded-lg p-6 transition-colors hover:border-gray-400">
                  <div className="text-center">
                    <input
                      type="file"
                      onChange={handleImageChange}
                      accept="image/*"
                      className="hidden"
                      id="premium-banner-images"
                      multiple
                    />
                    <label
                      htmlFor="premium-banner-images"
                      className="cursor-pointer inline-flex flex-col items-center"
                    >
                      <div className="p-3 bg-purple-100 rounded-lg text-purple-500 mb-3">
                        <Plus className="w-6 h-6" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        Click to upload banner images
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        You can select multiple images (up to 5)
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {showSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center animate-fade-in">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-green-700">Banners created successfully!</span>
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
                  disabled={showSuccess || bannerForm.images.length === 0 || isCreating}
                >
                  {isCreating ? (
                    <>
                      <LoadingSpinner />
                      <span className="ml-2">Creating...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Premium Banners
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedBannerIndex !== null && homeData?.premiumBannerUrls && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-red-600">Delete Premium Banner</h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-medium text-gray-900">
                    Are you sure?
                  </h4>
                  <p className="text-sm text-gray-500">
                    This action cannot be undone.
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="flex items-center space-x-3">
                  <img
                    src={homeData.premiumBannerUrls[selectedBannerIndex].path}
                    alt={`Banner ${selectedBannerIndex + 1}`}
                    className="h-12 w-20 object-cover rounded-lg"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Premium Banner {selectedBannerIndex + 1}</p>
                    <p className="text-sm text-gray-500">This banner will be permanently removed</p>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-700">
                You are about to delete this premium banner. This action will permanently remove the banner from your collection.
              </p>
            </div>

            {showSuccess && (
              <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-green-700">Banner deleted successfully!</span>
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center"
                disabled={showSuccess || isDeleting}
              >
                {isDeleting ? (
                  <>
                    <LoadingSpinner />
                    <span className="ml-2">Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Banner
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PremiumBanner;
