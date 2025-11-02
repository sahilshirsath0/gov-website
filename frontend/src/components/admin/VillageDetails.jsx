// components/admin/VillageDetails.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Plus, 
  Edit2, 
  Eye, 
  Save,
  Upload,
  X,
  MapPin,
  Globe,
  FileText,
  Trash2,
  Search,
  Filter
} from 'lucide-react';
import { adminAPI } from '../../services/api';

const VillageDetails = () => {
  const { t } = useTranslation('admin');
  const [villageDetails, setVillageDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create');
  const [selectedVillageDetail, setSelectedVillageDetail] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [formData, setFormData] = useState({
    title: {
      en: '',
      mr: ''
    },
    description: {
      en: '',
      mr: ''
    }
  });

  useEffect(() => {
    fetchVillageDetails();
  }, []);

  const fetchVillageDetails = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getVillageDetails();
      console.log('Fetched village details:', response.data.data);
      setVillageDetails(response.data.data || []);
    } catch (error) {
      console.error('Error fetching village details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    console.log('Create button clicked');
    setModalType('create');
    setSelectedVillageDetail(null);
    setFormData({
      title: { en: '', mr: '' },
      description: { en: '', mr: '' }
    });
    setSelectedFile(null);
    setPreviewUrl('');
    setSubmitError('');
    setShowModal(true);
  };

  const handleEdit = (villageDetail) => {
    console.log('Edit button clicked');
    setModalType('edit');
    setSelectedVillageDetail(villageDetail);
    setFormData({
      title: {
        en: villageDetail?.title?.en || '',
        mr: villageDetail?.title?.mr || ''
      },
      description: {
        en: villageDetail?.description?.en || '',
        mr: villageDetail?.description?.mr || ''
      }
    });
    setSelectedFile(null);
    setPreviewUrl('');
    setSubmitError('');
    setShowModal(true);
  };

  const handleView = (villageDetail) => {
    console.log('View button clicked');
    setModalType('view');
    setSelectedVillageDetail(villageDetail);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('villageDetails.confirmDelete'))) {
      try {
        await adminAPI.deleteVillageDetail(id);
        fetchVillageDetails();
      } catch (error) {
        console.error('Error deleting village detail:', error);
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setSubmitError('Please select a valid image file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setSubmitError('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
      setSubmitError('');
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    console.log('Form submitted with data:', formData);

    if (!formData.title.en.trim() || !formData.title.mr.trim()) {
      setSubmitError('Please enter title in both English and Marathi');
      return;
    }

    if (!formData.description.en.trim() || !formData.description.mr.trim()) {
      setSubmitError('Please enter description in both English and Marathi');
      return;
    }

    if (modalType === 'create' && !selectedFile) {
      setSubmitError('Please select an image file');
      return;
    }

    try {
      const submitData = {
        title: formData.title,
        description: formData.description
      };

      if (selectedFile) {
        const base64Data = await convertFileToBase64(selectedFile);
        submitData.imageData = base64Data;
        submitData.contentType = selectedFile.type;
        submitData.filename = selectedFile.name;
        submitData.size = selectedFile.size;
      }

      console.log('Submitting data:', submitData);

      if (modalType === 'create') {
        await adminAPI.createVillageDetail(submitData);
      } else {
        await adminAPI.updateVillageDetail(selectedVillageDetail._id, submitData);
      }

      setShowModal(false);
      fetchVillageDetails();
      setFormData({
        title: { en: '', mr: '' },
        description: { en: '', mr: '' }
      });
      setSelectedFile(null);
      setPreviewUrl('');
    } catch (error) {
      console.error('Error submitting village detail:', error);
      setSubmitError(error.response?.data?.message || 'Error submitting village detail');
    }
  };

  const filteredVillageDetails = villageDetails.filter(detail => 
    detail.title?.en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    detail.title?.mr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    detail.description?.en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    detail.description?.mr?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 absolute top-0 left-0"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                <MapPin className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{t('villageDetails.title')}</h1>
                <p className="text-blue-100 mt-1 text-sm">{t('villageDetails.subtitle')}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                <span className="font-semibold">{villageDetails.length}</span> Total Details
              </div>
            </div>
          </div>
          
          <button
            onClick={handleCreate}
            className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3.5 rounded-xl flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 font-semibold group"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
            {t('villageDetails.create')}
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-3 border-b border-gray-200">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2">
            <Filter size={18} />
            Search Village Details
          </h3>
        </div>
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors duration-200" size={20} />
              <input
                type="text"
                placeholder="Search village details..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Village Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredVillageDetails.length === 0 ? (
          <div className="col-span-full">
            <div className="bg-white rounded-2xl shadow-lg border-2 border-dashed border-gray-300 p-16 text-center">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin size={48} className="text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">{t('villageDetails.empty.title')}</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {t('villageDetails.empty.description')}
              </p>
              <button
                onClick={handleCreate}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3.5 rounded-xl inline-flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
              >
                <Plus size={20} />
                {t('villageDetails.create')}
              </button>
            </div>
          </div>
        ) : (
          filteredVillageDetails.map((detail) => (
            <div key={detail._id} className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
              {/* Image */}
              <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-blue-100 overflow-hidden">
                {detail.image?.data ? (
                  <img
                    src={detail.image.data}
                    alt={detail.title?.en}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FileText size={48} className="text-gray-400" />
                  </div>
                )}
              </div>

              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors duration-300 line-clamp-2">
                    {detail.title?.en}
                  </h3>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => handleView(detail)}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                      title={t('common.view')}
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleEdit(detail)}
                      className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                      title={t('common.edit')}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(detail._id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                      title={t('common.delete')}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-4">
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                    {detail.description?.en}
                  </p>
                </div>

                {/* Footer */}
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 px-2 py-1 rounded-md font-medium">
                      {formatDate(detail.createdAt)}
                    </span>
                    <span className="text-gray-500 font-medium">
                      {detail.createdBy?.username || 'Admin'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal - Same as before but updated to handle selectedVillageDetail */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 text-white">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                    {modalType === 'create' && <Plus size={24} />}
                    {modalType === 'edit' && <Edit2 size={24} />}
                    {modalType === 'view' && <Eye size={24} />}
                  </div>
                  {modalType === 'create' && t('villageDetails.modal.create')}
                  {modalType === 'edit' && t('villageDetails.modal.edit')}
                  {modalType === 'view' && t('villageDetails.modal.view')}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-200"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              {modalType === 'view' ? (
                <div className="space-y-6">
                  {/* View Mode Content */}
                  {selectedVillageDetail?.image?.data && (
                    <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-xl">
                      <img
                        src={selectedVillageDetail.image.data}
                        alt="Village"
                        className="max-w-full h-64 object-contain mx-auto rounded-xl shadow-lg"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* English Content */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-100">
                      <h4 className="font-bold text-blue-800 mb-4 flex items-center gap-2">
                        <div className="w-6 h-4 bg-gradient-to-r from-blue-600 to-red-600 rounded-sm"></div>
                        {t('villageDetails.form.englishContent')}
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">{t('villageDetails.form.title')}</label>
                          <p className="text-gray-900 font-semibold">{selectedVillageDetail?.title?.en}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">{t('villageDetails.form.description')}</label>
                          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedVillageDetail?.description?.en}</p>
                        </div>
                      </div>
                    </div>

                    {/* Marathi Content */}
                    <div className="bg-gradient-to-br from-orange-50 to-red-50 p-5 rounded-xl border border-orange-100">
                      <h4 className="font-bold text-orange-800 mb-4 flex items-center gap-2">
                        <div className="w-6 h-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-sm"></div>
                        {t('villageDetails.form.marathiContent')}
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">{t('villageDetails.form.titleMr')}</label>
                          <p className="text-gray-900 font-semibold">{selectedVillageDetail?.title?.mr}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">{t('villageDetails.form.descriptionMr')}</label>
                          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedVillageDetail?.description?.mr}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {submitError && (
                    <div className="bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 text-red-700 px-5 py-4 rounded-xl">
                      {submitError}
                    </div>
                  )}

                  {/* Image Upload */}
                  {modalType === 'create' && (
                    <div className="space-y-4">
                      <label className="block text-sm font-bold text-gray-700">{t('villageDetails.form.villageImage')} *</label>
                      <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-48 border-3 border-blue-300 border-dashed rounded-2xl cursor-pointer bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all duration-300">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-10 h-10 mb-3 text-blue-500" />
                            <p className="mb-2 text-sm text-gray-700 font-semibold">
                              <span className="text-blue-600">{t('villageDetails.form.clickToUpload')}</span>
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
                            className="w-full h-48 object-cover rounded-xl border-2 border-blue-200"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedFile(null);
                              setPreviewUrl('');
                            }}
                            className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {modalType === 'edit' && (
                    <div className="space-y-4">
                      <label className="block text-sm font-bold text-gray-700">{t('villageDetails.form.updateImage')}</label>
                      <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-3 border-blue-300 border-dashed rounded-2xl cursor-pointer bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all duration-300">
                          <div className="flex flex-col items-center justify-center pt-3 pb-3">
                            <Upload className="w-6 h-6 mb-2 text-blue-500" />
                            <p className="text-xs text-gray-700 font-semibold">{t('villageDetails.form.clickToUpload')}</p>
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
                            className="w-full h-32 object-cover rounded-xl border-2 border-blue-200"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedFile(null);
                              setPreviewUrl('');
                            }}
                            className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Multi-language Form */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* English Form */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-100">
                      <h4 className="font-bold text-blue-800 mb-4 flex items-center gap-2">
                        <div className="w-6 h-4 bg-gradient-to-r from-blue-600 to-red-600 rounded-sm"></div>
                        {t('villageDetails.form.englishContent')}
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">{t('villageDetails.form.titleEn')} *</label>
                          <input
                            type="text"
                            value={formData.title.en}
                            onChange={(e) => setFormData({
                              ...formData,
                              title: { ...formData.title, en: e.target.value }
                            })}
                            placeholder={t('villageDetails.form.titlePlaceholderEn')}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">{t('villageDetails.form.descriptionEn')} *</label>
                          <textarea
                            value={formData.description.en}
                            onChange={(e) => setFormData({
                              ...formData,
                              description: { ...formData.description, en: e.target.value }
                            })}
                            placeholder={t('villageDetails.form.descriptionPlaceholderEn')}
                            rows={6}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Marathi Form */}
                    <div className="bg-gradient-to-br from-orange-50 to-red-50 p-5 rounded-xl border border-orange-100">
                      <h4 className="font-bold text-orange-800 mb-4 flex items-center gap-2">
                        <div className="w-6 h-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-sm"></div>
                        {t('villageDetails.form.marathiContent')}
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">{t('villageDetails.form.titleMr')} *</label>
                          <input
                            type="text"
                            value={formData.title.mr}
                            onChange={(e) => setFormData({
                              ...formData,
                              title: { ...formData.title, mr: e.target.value }
                            })}
                            placeholder={t('villageDetails.form.titlePlaceholderMr')}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">{t('villageDetails.form.descriptionMr')} *</label>
                          <textarea
                            value={formData.description.mr}
                            onChange={(e) => setFormData({
                              ...formData,
                              description: { ...formData.description, mr: e.target.value }
                            })}
                            placeholder={t('villageDetails.form.descriptionPlaceholderMr')}
                            rows={6}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 border-2 border-gray-300 rounded-xl font-semibold transition-all duration-200"
                    >
                      {t('villageDetails.form.cancel')}
                    </button>
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <Save size={18} />
                      {modalType === 'create' ? t('villageDetails.form.create') : t('villageDetails.form.update')}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VillageDetails;
