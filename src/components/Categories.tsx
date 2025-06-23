import React, { useState, useEffect } from 'react';
import { FolderOpen, Film, Tv, Plus, X, Database, FolderPlus, Lock, ExternalLink, Edit3, Trash2 } from 'lucide-react';
import { apiRequest } from '../utils/api';

// Updated interfaces for the new API response
interface Subcategory {
  categoryId: string;
  name: string;
  title: string;
  imageUrl: string;
  telegramUrl: string;
  isPremium: boolean;
}

interface CategoryDetails {
  categoryId: string;
  name: string;
  isMainCategory: boolean;
  parentCategoryId: string | null;
  isPremium: boolean;
  subcategories: Subcategory[];
}

interface Category {
  categoryId: string;
  name: string;
}

interface SubCategoryForm {
  name: string;
  title: string;
  telegramUrl: string;
  isPremium: boolean;
  image: File | null;
  parentCategoryId: string;
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

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showDataModal, setShowDataModal] = useState(false);
  const [showSubCategoryModal, setShowSubCategoryModal] = useState(false);
  const [showEditSubCategoryModal, setShowEditSubCategoryModal] = useState(false);
  const [showDeleteSubCategoryModal, setShowDeleteSubCategoryModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingSubCategory, setIsUpdatingSubCategory] = useState(false);
  const [isDeletingSubCategory, setIsDeletingSubCategory] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSubmittingSubCategory, setIsSubmittingSubCategory] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<Subcategory | null>(null);
  const [categoryDetails, setCategoryDetails] = useState<CategoryDetails | null>(null);
  const [subCategoryForm, setSubCategoryForm] = useState<SubCategoryForm>({
    name: '',
    title: '',
    telegramUrl: '',
    isPremium: false,
    image: null,
    parentCategoryId: '',
  });
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
  });
  const [editForm, setEditForm] = useState({
    name: '',
  });
  const [editSubCategoryForm, setEditSubCategoryForm] = useState<SubCategoryForm>({
    name: '',
    title: '',
    telegramUrl: '',
    isPremium: false,
    image: null,
    parentCategoryId: '',
  });
  const [editPreviewUrl, setEditPreviewUrl] = useState<string | null>(null);

  const getCategoryIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('movie')) return <Film className="w-6 h-6 text-sky-500 mr-3" />;
    if (lowerName.includes('series')) return <Tv className="w-6 h-6 text-purple-500 mr-3" />;
    return <FolderOpen className="w-6 h-6 text-gray-400 mr-3" />;
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('/categories/main');
      if (response.success && Array.isArray(response.data)) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    try {
      setIsCreating(true);
      const response = await apiRequest('/categories/main', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      if (response.success && response.data) {
        setCategories([...categories, response.data]);
        setShowSuccess(true);
        // Close modal after showing success message for 1.5 seconds
        setTimeout(() => {
          setShowSuccess(false);
          setShowCreateModal(false);
          setForm({ name: '' });
        }, 1500);
      }
    } catch (error) {
      console.error('Error creating category:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(category);
    setShowActionModal(true);
  };

  const handleGetAllData = async () => {
    try {
      setIsLoadingData(true);
      const response = await apiRequest(`/categories/${selectedCategory?.categoryId}`);
      if (response.success && response.data) {
        setCategoryDetails(response.data);
        setShowDataModal(true);
        setShowActionModal(false);
      }
    } catch (error) {
      console.error('Error fetching category data:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleAddSubCategory = () => {
    if (selectedCategory) {
      setSubCategoryForm(prev => ({
        ...prev,
        parentCategoryId: selectedCategory.categoryId
      }));
      setShowSubCategoryModal(true);
      setShowActionModal(false);
    }
  };

  const handleEditCategory = () => {
    if (selectedCategory) {
      setEditForm({ name: selectedCategory.name });
      setShowEditModal(true);
      setShowActionModal(false);
    }
  };

  const handleDeleteCategory = () => {
    setShowDeleteModal(true);
    setShowActionModal(false);
  };

  const handleUpdateCategory = async () => {
    if (!selectedCategory) return;
    
    try {
      setIsUpdating(true);
      const response = await apiRequest(`/categories/update-main/${selectedCategory.categoryId}`, {
        method: 'POST',
        body: JSON.stringify(editForm),
      });
      
      if (response.success) {
        // Update the category in the local state
        setCategories(categories.map(cat => 
          cat.categoryId === selectedCategory.categoryId 
            ? { ...cat, name: editForm.name }
            : cat
        ));
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          setShowEditModal(false);
          setEditForm({ name: '' });
        }, 1500);
      }
    } catch (error) {
      console.error('Error updating category:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedCategory) return;
    
    try {
      setIsDeleting(true);
      const response = await apiRequest(`/categories/delete-main/${selectedCategory.categoryId}`, {
        method: 'POST',
      });
      
      if (response.success) {
        // Remove the category from the local state
        setCategories(categories.filter(cat => cat.categoryId !== selectedCategory.categoryId));
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          setShowDeleteModal(false);
          setSelectedCategory(null);
        }, 1500);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditSubCategory = (subcategory: Subcategory) => {
    setSelectedSubCategory(subcategory);
    setEditSubCategoryForm({
      name: subcategory.name,
      title: subcategory.title,
      telegramUrl: subcategory.telegramUrl,
      isPremium: subcategory.isPremium,
      image: null, // We'll handle existing image separately
      parentCategoryId: subcategory.categoryId,
    });
    setEditPreviewUrl(subcategory.imageUrl); // Show existing image
    setShowEditSubCategoryModal(true);
  };

  const handleDeleteSubCategory = (subcategory: Subcategory) => {
    setSelectedSubCategory(subcategory);
    setShowDeleteSubCategoryModal(true);
  };

  const handleUpdateSubCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubCategory) return;

    try {
      setIsUpdatingSubCategory(true);
      const formData = new FormData();
      
      const subcategoryData = {
        name: editSubCategoryForm.name,
        title: editSubCategoryForm.title,
        telegramUrl: editSubCategoryForm.telegramUrl,
        isPremium: editSubCategoryForm.isPremium,
      };

      Object.entries(subcategoryData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
      
      if (editSubCategoryForm.image) {
        formData.append('image', editSubCategoryForm.image);
      }

      const response = await apiRequest(`/categories/update-sub/${selectedSubCategory.categoryId}`, {
        method: 'POST',
        body: formData,
      });

      if (response.success) {
        setShowSuccess(true);
        // Refresh the category details
        handleGetAllData();
        setTimeout(() => {
          setShowSuccess(false);
          setShowEditSubCategoryModal(false);
          setEditSubCategoryForm({
            name: '',
            title: '',
            telegramUrl: '',
            isPremium: false,
            image: null,
            parentCategoryId: '',
          });
          setEditPreviewUrl(null);
          setSelectedSubCategory(null);
        }, 1500);
      }
    } catch (error) {
      console.error('Error updating subcategory:', error);
    } finally {
      setIsUpdatingSubCategory(false);
    }
  };

  const handleConfirmDeleteSubCategory = async () => {
    if (!selectedSubCategory) return;
    
    try {
      setIsDeletingSubCategory(true);
      const response = await apiRequest(`/categories/delete-sub/${selectedSubCategory.categoryId}`, {
        method: 'POST',
      });
      
      if (response.success) {
        setShowSuccess(true);
        // Refresh the category details
        handleGetAllData();
        setTimeout(() => {
          setShowSuccess(false);
          setShowDeleteSubCategoryModal(false);
          setSelectedSubCategory(null);
        }, 1500);
      }
    } catch (error) {
      console.error('Error deleting subcategory:', error);
    } finally {
      setIsDeletingSubCategory(false);
    }
  };

  const handleSubCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) {
      console.error('No parent category selected');
      return;
    }

    try {
      setIsSubmittingSubCategory(true);
      // Create a new FormData instance
      const formData = new FormData();
      
      // Prepare the subcategory data without the image
      const subcategoryData = {
        name: subCategoryForm.name,
        title: subCategoryForm.title,
        telegramUrl: subCategoryForm.telegramUrl,
        isPremium: subCategoryForm.isPremium,
        parentCategoryId: selectedCategory.categoryId // Changed to parentCategoryId to match API expectation
      };

      console.log('Submitting with data:', subcategoryData); // Debug log

      // Add each field individually to FormData
      Object.entries(subcategoryData).forEach(([key, value]) => {
        formData.append(key, String(value)); // Ensure proper string conversion
      });
      
      // Append the image file separately if it exists
      if (subCategoryForm.image) {
        formData.append('image', subCategoryForm.image);
      }

      const response = await apiRequest('/categories/sub', {
        method: 'POST',
        body: formData,
        headers: {} // Let the browser set the Content-Type for FormData
      });

      if (response.success) {
        setShowSuccess(true);
        // Refresh the category details
        handleGetAllData();
        // Close modal after showing success message
        setTimeout(() => {
          setShowSuccess(false);
          setShowSubCategoryModal(false);
          setSubCategoryForm({
            name: '',
            title: '',
            telegramUrl: '',
            isPremium: false,
            image: null,
            parentCategoryId: '',
          });
          setPreviewUrl(null);
        }, 1500);
      }
    } catch (error) {
      console.error('Error creating subcategory:', error);
    } finally {
      setIsSubmittingSubCategory(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setSubCategoryForm(prev => ({ ...prev, image: file }));
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSubCategoryForm(prev => ({ ...prev, image: file }));
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setEditSubCategoryForm(prev => ({ ...prev, image: file }));
      const url = URL.createObjectURL(file);
      setEditPreviewUrl(url);
    }
  };

  const handleEditDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleEditDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleEditDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setEditSubCategoryForm(prev => ({ ...prev, image: file }));
      const url = URL.createObjectURL(file);
      setEditPreviewUrl(url);
    }
  };

  useEffect(() => {
    fetchCategories();
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
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors inline-flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Main Category
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="space-y-4">
          <div className="flex items-center">
            <FolderOpen className="w-6 h-6 text-gray-400 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Main Categories</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((category) => (
              <div
                key={category.categoryId}
                onClick={() => handleCategoryClick(category)}
                className="bg-gray-50 p-4 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {getCategoryIcon(category.name)}
                    <div>
                      <h3 className="font-medium text-gray-900">{category.name}</h3>
                    </div>
                  </div>
                  <FolderPlus className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create Category Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Create Main Category</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateCategory();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                  required
                />
              </div>

              {showSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-green-700">Category created successfully!</span>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600 flex items-center"
                  disabled={showSuccess || isCreating}
                >
                  {isCreating ? (
                    <>
                      <LoadingSpinner />
                      <span className="ml-2">Creating...</span>
                    </>
                  ) : (
                    'Create Category'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Edit Main Category</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdateCategory();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                  required
                />
              </div>

              {showSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-green-700">Category updated successfully!</span>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center"
                  disabled={showSuccess || isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <LoadingSpinner />
                      <span className="ml-2">Updating...</span>
                    </>
                  ) : (
                    <>
                      <Edit3 className="w-4 h-4 mr-2" />
                      Update Category
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-red-600">Delete Category</h3>
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
              <p className="text-gray-700">
                You are about to delete the category <strong>"{selectedCategory.name}"</strong>. 
                This will also delete all associated subcategories and data.
              </p>
            </div>

            {showSuccess && (
              <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-green-700">Category deleted successfully!</span>
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
                    Delete Category
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Action Modal */}
      {showActionModal && selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedCategory.name}
              </h3>
              <button
                onClick={() => setShowActionModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleGetAllData}
                className="w-full flex items-center justify-center px-4 py-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
                disabled={isLoadingData}
              >
                {isLoadingData ? (
                  <>
                    <LoadingSpinner />
                    <span className="ml-2">Loading...</span>
                  </>
                ) : (
                  <>
                    <Database className="w-5 h-5 mr-2" />
                    Get All Data
                  </>
                )}
              </button>
              
              <button
                onClick={handleAddSubCategory}
                className="w-full flex items-center justify-center px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                <FolderPlus className="w-5 h-5 mr-2" />
                Add Sub Categories
              </button>

              <div className="flex space-x-3">
                <button
                  onClick={handleEditCategory}
                  className="flex-1 flex items-center justify-center px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <Edit3 className="w-5 h-5 mr-2" />
                  Edit
                </button>
                
                <button
                  onClick={handleDeleteCategory}
                  className="flex-1 flex items-center justify-center px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="w-5 h-5 mr-2" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Data Table Modal */}
      {showDataModal && categoryDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-5xl max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {categoryDetails.name} - Subcategories
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Main Category • {categoryDetails.isPremium ? 'Premium' : 'Free'}
                </p>
              </div>
              <button
                onClick={() => setShowDataModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telegram</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categoryDetails.subcategories.map((subcategory) => (
                    <tr key={subcategory.categoryId} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <img
                          src={subcategory.imageUrl}
                          alt={subcategory.name}
                          className="h-12 w-20 object-cover rounded-lg"
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">{subcategory.name}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-500">{subcategory.title}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {subcategory.isPremium ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            <Lock className="w-3 h-3 mr-1" />
                            Premium
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Free
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <a
                          href={subcategory.telegramUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm text-sky-600 hover:text-sky-900"
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          View
                        </a>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditSubCategory(subcategory)}
                            className="inline-flex items-center p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-lg transition-colors"
                            title="Edit subcategory"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSubCategory(subcategory)}
                            className="inline-flex items-center p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete subcategory"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Subcategory Form Modal */}
      {showSubCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Add Sub Category</h3>
              <button
                onClick={() => setShowSubCategoryModal(false)}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubCategorySubmit} className="space-y-6">
              <input
                type="hidden"
                name="parentCategoryId"
                value={subCategoryForm.parentCategoryId}
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={subCategoryForm.name}
                    onChange={(e) => setSubCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={subCategoryForm.title}
                    onChange={(e) => setSubCategoryForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telegram URL <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={subCategoryForm.telegramUrl}
                    onChange={(e) => setSubCategoryForm(prev => ({ ...prev, telegramUrl: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                    placeholder="https://t.me/yourchannel"
                    required
                  />
                  <ExternalLink className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  <span className="text-red-400">*</span> Telegram URL is required and must start with https://t.me/
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image
                </label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative border-2 border-dashed rounded-lg p-8 transition-colors ${
                    isDragging
                      ? 'border-sky-500 bg-sky-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {previewUrl ? (
                    <div className="relative group">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewUrl(null);
                            setSubCategoryForm(prev => ({ ...prev, image: null }));
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
                        id="image-upload"
                        required
                      />
                      <label
                        htmlFor="image-upload"
                        className="cursor-pointer inline-flex flex-col items-center"
                      >
                        <div className="p-3 bg-sky-100 rounded-lg text-sky-500 mb-3">
                          <Plus className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          Click to upload or drag and drop
                        </span>
                        <span className="text-xs text-gray-500 mt-1">
                          PNG, JPG up to 10MB
                        </span>
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center bg-gray-50 p-4 rounded-lg">
                <input
                  type="checkbox"
                  id="isPremium"
                  checked={subCategoryForm.isPremium}
                  onChange={(e) => setSubCategoryForm(prev => ({ ...prev, isPremium: e.target.checked }))}
                  className="h-5 w-5 text-sky-600 focus:ring-sky-500 border-gray-300 rounded transition-colors"
                />
                <label htmlFor="isPremium" className="ml-3 flex items-center">
                  <Lock className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Premium Content</span>
                </label>
              </div>

              {showSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center animate-fade-in">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-green-700">Subcategory created successfully!</span>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowSubCategoryModal(false)}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors flex items-center"
                  disabled={showSuccess || !subCategoryForm.image || isSubmittingSubCategory}
                >
                  {isSubmittingSubCategory ? (
                    <>
                      <LoadingSpinner />
                      <span className="ml-2">Creating...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Subcategory
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Subcategory Modal */}
      {showEditSubCategoryModal && selectedSubCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Edit Sub Category</h3>
              <button
                onClick={() => setShowEditSubCategoryModal(false)}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleUpdateSubCategory} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={editSubCategoryForm.name}
                    onChange={(e) => setEditSubCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={editSubCategoryForm.title}
                    onChange={(e) => setEditSubCategoryForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telegram URL <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={editSubCategoryForm.telegramUrl}
                    onChange={(e) => setEditSubCategoryForm(prev => ({ ...prev, telegramUrl: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                    placeholder="https://t.me/yourchannel"
                    required
                  />
                  <ExternalLink className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image (Optional - leave empty to keep current image)
                </label>
                <div
                  onDragOver={handleEditDragOver}
                  onDragLeave={handleEditDragLeave}
                  onDrop={handleEditDrop}
                  className={`relative border-2 border-dashed rounded-lg p-8 transition-colors ${
                    isDragging
                      ? 'border-sky-500 bg-sky-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {editPreviewUrl ? (
                    <div className="relative group">
                      <img
                        src={editPreviewUrl}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => {
                            setEditPreviewUrl(selectedSubCategory?.imageUrl || null);
                            setEditSubCategoryForm(prev => ({ ...prev, image: null }));
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
                        onChange={handleEditImageChange}
                        accept="image/*"
                        className="hidden"
                        id="edit-image-upload"
                      />
                      <label
                        htmlFor="edit-image-upload"
                        className="cursor-pointer inline-flex flex-col items-center"
                      >
                        <div className="p-3 bg-sky-100 rounded-lg text-sky-500 mb-3">
                          <Plus className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          Click to upload or drag and drop
                        </span>
                        <span className="text-xs text-gray-500 mt-1">
                          PNG, JPG up to 10MB
                        </span>
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center bg-gray-50 p-4 rounded-lg">
                <input
                  type="checkbox"
                  id="editIsPremium"
                  checked={editSubCategoryForm.isPremium}
                  onChange={(e) => setEditSubCategoryForm(prev => ({ ...prev, isPremium: e.target.checked }))}
                  className="h-5 w-5 text-sky-600 focus:ring-sky-500 border-gray-300 rounded transition-colors"
                />
                <label htmlFor="editIsPremium" className="ml-3 flex items-center">
                  <Lock className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Premium Content</span>
                </label>
              </div>

              {showSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center animate-fade-in">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-green-700">Subcategory updated successfully!</span>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowEditSubCategoryModal(false)}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center"
                  disabled={showSuccess || isUpdatingSubCategory}
                >
                  {isUpdatingSubCategory ? (
                    <>
                      <LoadingSpinner />
                      <span className="ml-2">Updating...</span>
                    </>
                  ) : (
                    <>
                      <Edit3 className="w-4 h-4 mr-2" />
                      Update Subcategory
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Subcategory Confirmation Modal */}
      {showDeleteSubCategoryModal && selectedSubCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-red-600">Delete Subcategory</h3>
              <button
                onClick={() => setShowDeleteSubCategoryModal(false)}
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
                    src={selectedSubCategory.imageUrl}
                    alt={selectedSubCategory.name}
                    className="h-12 w-20 object-cover rounded-lg"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{selectedSubCategory.name}</p>
                    <p className="text-sm text-gray-500">{selectedSubCategory.title}</p>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-700">
                You are about to delete the subcategory <strong>"{selectedSubCategory.name}"</strong>. 
                This will permanently remove all associated data.
              </p>
            </div>

            {showSuccess && (
              <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-green-700">Subcategory deleted successfully!</span>
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowDeleteSubCategoryModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={isDeletingSubCategory}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteSubCategory}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center"
                disabled={showSuccess || isDeletingSubCategory}
              >
                {isDeletingSubCategory ? (
                  <>
                    <LoadingSpinner />
                    <span className="ml-2">Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Subcategory
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

export default Categories;