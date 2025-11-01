import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  Search, 
  Filter,
  ImageIcon,
  X,
  Save,
  Upload,
  ZoomIn
} from 'lucide-react';
import { adminAPI } from '../../services/api';

const Gallery = () => {
  const { t } = useTranslation('admin');
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalType, setModalType] = useState('create');
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getGallery();
      setGallery(response.data.data || []);
    } catch (error) {
      console.error('Error fetching gallery:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setModalType('create');
    setSelectedItem(null);
    setFormData({ name: '', description: '' });
    setSelectedFile(null);
    setPreviewUrl('');
    setSubmitError('');
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setModalType('edit');
    setSelectedItem(item);
    setFormData({
      name: item.name,
      description: item.description || ''
    });
    setSelectedFile(null);
    setPreviewUrl('');
    setSubmitError('');
    setShowModal(true);
  };

  const handleView = (item) => {
    setModalType('view');
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleImageView = (item) => {
    setSelectedItem(item);
    setShowImageModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('gallery.confirmDelete'))) {
      try {
        await adminAPI.deleteGalleryItem(id);
        fetchGallery();
      } catch (error) {
        console.error('Error deleting gallery item:', error);
      }
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setSubmitError('');

  if (modalType === 'create' && !selectedFile) {
    setSubmitError('Please select an image file');
    return;
  }

  if (!formData.name.trim()) {
    setSubmitError('Please enter a name for the gallery item');
    return;
  }

  try {
    if (modalType === 'create') {
      // Convert file to base64
      const base64Data = await convertFileToBase64(selectedFile);
      
      const submitData = {
        name: formData.name.trim(),
        description: formData.description?.trim() || '',
        imageData: base64Data,
        contentType: selectedFile.type,
        filename: selectedFile.name,
        size: selectedFile.size
      };

      console.log('Submitting gallery item with base64 data');
      await adminAPI.createGalleryItem(submitData);
    } else {
      await adminAPI.updateGalleryItem(selectedItem._id, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        isActive: true
      });
    }

    setShowModal(false);
    fetchGallery();
    setFormData({ name: '', description: '' });
    setSelectedFile(null);
    setPreviewUrl('');
  } catch (error) {
    console.error('Error submitting gallery item:', error);
    setSubmitError(error.response?.data?.message || 'Error submitting gallery item');
  }
};

// Add this helper function to convert file to base64
const convertFileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};



  const handleFileChange = (e) => {
  const file = e.target.files[0];
  console.log('Selected file:', file); // Debug log
  
  if (file) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setSubmitError('Please select a valid image file');
      return;
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setSubmitError('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file); // Make sure this is setting the actual File object
    setSubmitError('');
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    
    console.log('File set in state:', file); // Debug log
  }
};


  const removeFile = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    // Reset the file input
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const filteredGallery = gallery.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterStatus === 'all' || 
      (filterStatus === 'active' && item.isActive) ||
      (filterStatus === 'inactive' && !item.isActive);
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

const getImageUrl = (item) => {
  if (item.image && item.image.data) {
    return item.image.data; // This is already a data URL (data:image/jpeg;base64,...)
  }
  return null;
};


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('gallery.title')}
          </h1>
          <p className="text-gray-600">
            {t('gallery.subtitle')}
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
        >
          <Plus size={20} />
          {t('gallery.create')}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder={t('gallery.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">{t('gallery.filter.all')}</option>
              <option value="active">{t('gallery.filter.active')}</option>
              <option value="inactive">{t('gallery.filter.inactive')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredGallery.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-400 mb-4">
              <ImageIcon size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t('gallery.empty.title')}
            </h3>
            <p className="text-gray-600 mb-4">
              {t('gallery.empty.description')}
            </p>
            <button
              onClick={handleCreate}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2"
            >
              <Plus size={20} />
              {t('gallery.create')}
            </button>
          </div>
        ) : (
          filteredGallery.map((item) => (
            <div key={item._id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200">
              {/* Image */}
              <div className="relative aspect-square bg-gray-100">
                {getImageUrl(item) ? (
                  <img
                    src={getImageUrl(item)}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <ImageIcon size={48} />
                  </div>
                )}
                
                {/* Image Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
                  <button
                    onClick={() => handleImageView(item)}
                    className="bg-white text-gray-900 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                  >
                    <ZoomIn size={20} />
                  </button>
                </div>

                {/* Status Badge */}
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    item.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {item.isActive ? t('gallery.status.active') : t('gallery.status.inactive')}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={() => handleView(item)}
                      className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors duration-200"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-1 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors duration-200"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {item.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {item.description}
                  </p>
                )}

                <div className="text-xs text-gray-500">
                  <p>{t('gallery.createdBy')}: {item.createdBy?.username}</p>
                  <p>{formatDate(item.createdAt)}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {modalType === 'create' && t('gallery.modal.create')}
                {modalType === 'edit' && t('gallery.modal.edit')}
                {modalType === 'view' && t('gallery.modal.view')}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {modalType === 'view' ? (
                <div className="space-y-6">
                  {getImageUrl(selectedItem) && (
                    <div className="text-center">
                      <img
                        src={getImageUrl(selectedItem)}
                        alt={selectedItem?.name}
                        className="max-w-full h-64 object-contain mx-auto rounded-lg border border-gray-200"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('gallery.form.name')}
                      </label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                        {selectedItem?.name}
                      </p>
                    </div>

                    {selectedItem?.description && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('gallery.form.description')}
                        </label>
                        <p className="text-gray-900 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">
                          {selectedItem.description}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('gallery.form.status')}
                        </label>
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                          selectedItem?.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {selectedItem?.isActive ? t('gallery.status.active') : t('gallery.status.inactive')}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('gallery.form.created')}
                        </label>
                        <p className="text-sm text-gray-900">
                          {formatDate(selectedItem?.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Error Message */}
                  {submitError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                      {submitError}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('gallery.form.name')} *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder={t('gallery.form.namePlaceholder')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('gallery.form.description')}
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder={t('gallery.form.descriptionPlaceholder')}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {modalType === 'create' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('gallery.form.image')} *
                      </label>
                      <div className="space-y-3">
                        <div className="flex items-center justify-center w-full">
                          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Upload className="w-8 h-8 mb-3 text-gray-400" />
                              <p className="mb-2 text-sm text-gray-500">
                                <span className="font-semibold">{t('gallery.form.clickToUpload')}</span>
                              </p>
                              <p className="text-xs text-gray-500">PNG, JPG, GIF (MAX. 10MB)</p>
                            </div>
                            <input
                              type="file"
                              onChange={handleFileChange}
                              accept="image/*"
                              className="hidden"
                            />
                          </label>
                        </div>

                        {previewUrl && (
                          <div className="relative">
                            <img
                              src={previewUrl}
                              alt="Preview"
                              className="w-full h-32 object-cover rounded-lg border border-gray-200"
                            />
                            <button
                              type="button"
                              onClick={removeFile}
                              className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition-colors duration-200"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      {t('gallery.form.cancel')}
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
                    >
                      <Save size={16} />
                      {modalType === 'create' ? t('gallery.form.create') : t('gallery.form.update')}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Image View Modal */}
      {showImageModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors duration-200"
            >
              <X size={32} />
            </button>
            
            {getImageUrl(selectedItem) && (
              <img
                src={getImageUrl(selectedItem)}
                alt={selectedItem.name}
                className="max-w-full max-h-full object-contain"
              />
            )}
            
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4">
              <h3 className="text-lg font-medium">{selectedItem.name}</h3>
              {selectedItem.description && (
                <p className="text-sm text-gray-300 mt-1">{selectedItem.description}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
