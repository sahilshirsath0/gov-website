// components/admin/Programs.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  Search, 
  Filter,
  Award,
  X,
  Save,
  Upload,
  Calendar
} from 'lucide-react';
import { adminAPI } from '../../services/api';

const Programs = () => {
  const { t } = useTranslation('admin');
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create');
  const [selectedProgram, setSelectedProgram] = useState(null);
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
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getPrograms();
      setPrograms(response.data.data || []);
    } catch (error) {
      console.error('Error fetching programs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setModalType('create');
    setSelectedProgram(null);
    setFormData({ name: '', description: '' });
    setSelectedFile(null);
    setPreviewUrl('');
    setSubmitError('');
    setShowModal(true);
  };

  const handleEdit = (program) => {
    setModalType('edit');
    setSelectedProgram(program);
    setFormData({
      name: program.name,
      description: program.description
    });
    setSelectedFile(null);
    setPreviewUrl('');
    setSubmitError('');
    setShowModal(true);
  };

  const handleView = (program) => {
    setModalType('view');
    setSelectedProgram(program);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('programs.confirmDelete'))) {
      try {
        await adminAPI.deleteProgram(id);
        fetchPrograms();
      } catch (error) {
        console.error('Error deleting program:', error);
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

    if (!formData.name.trim()) {
      setSubmitError('Please enter program name');
      return;
    }

    if (!formData.description.trim()) {
      setSubmitError('Please enter program description');
      return;
    }

    if (modalType === 'create' && !selectedFile) {
      setSubmitError('Please select an image file');
      return;
    }

    try {
      const submitData = {
        name: formData.name.trim(),
        description: formData.description.trim()
      };

      if (selectedFile) {
        const base64Data = await convertFileToBase64(selectedFile);
        submitData.imageData = base64Data;
        submitData.contentType = selectedFile.type;
        submitData.filename = selectedFile.name;
        submitData.size = selectedFile.size;
      }

      if (modalType === 'create') {
        await adminAPI.createProgram(submitData);
      } else {
        submitData.isActive = true;
        await adminAPI.updateProgram(selectedProgram._id, submitData);
      }

      setShowModal(false);
      fetchPrograms();
      setFormData({ name: '', description: '' });
      setSelectedFile(null);
      setPreviewUrl('');
    } catch (error) {
      console.error('Error submitting program:', error);
      setSubmitError('Error submitting program');
    }
  };

  const filteredPrograms = programs.filter(program => {
    const matchesSearch = program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         program.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
      (filterStatus === 'active' && program.isActive) ||
      (filterStatus === 'inactive' && !program.isActive);
    return matchesSearch && matchesFilter;
  });

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
                <Award className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{t('programs.title')}</h1>
                <p className="text-blue-100 mt-1 text-sm">{t('programs.subtitle')}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                <span className="font-semibold">{programs.length}</span> {t('dashboard.stats.totalPrograms')}
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                <span className="font-semibold">{programs.filter(p => p.isActive).length}</span> {t('programs.status.active')}
              </div>
            </div>
          </div>
          <button
            onClick={handleCreate}
            className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3.5 rounded-xl flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 font-semibold group"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
            {t('programs.create')}
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-3 border-b border-gray-200">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2">
            <Filter size={18} />
            {t('programs.search')} & {t('common.filter')}
          </h3>
        </div>
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors duration-200" size={20} />
              <input
                type="text"
                placeholder={t('programs.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
              />
            </div>

            <div className="relative group w-full md:w-64">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors duration-200 pointer-events-none" size={20} />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pl-12 pr-10 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer bg-gray-50 focus:bg-white font-medium"
              >
                <option value="all">{t('programs.filter.all')}</option>
                <option value="active">{t('programs.filter.active')}</option>
                <option value="inactive">{t('programs.filter.inactive')}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Programs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredPrograms.length === 0 ? (
          <div className="col-span-full">
            <div className="bg-white rounded-2xl shadow-lg border-2 border-dashed border-gray-300 p-16 text-center">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award size={48} className="text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">{t('programs.empty.title')}</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {t('programs.empty.description')}
              </p>
              <button
                onClick={handleCreate}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3.5 rounded-xl inline-flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
              >
                <Plus size={20} />
                {t('programs.create')}
              </button>
            </div>
          </div>
        ) : (
          filteredPrograms.map((program) => (
            <div key={program._id} className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
              {/* Image */}
              <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-blue-100 overflow-hidden">
                {program.image?.data ? (
                  <img
                    src={program.image.data}
                    alt={program.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Award size={48} className="text-gray-400" />
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  <span className={`px-3 py-1.5 text-xs font-bold rounded-full shadow-lg ${
                    program.isActive 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                      : 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                  }`}>
                    {program.isActive ? t('programs.status.active') : t('programs.status.inactive')}
                  </span>
                </div>
              </div>

              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors duration-300">
                    {program.name}
                  </h3>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => handleView(program)}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                      title={t('common.view')}
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleEdit(program)}
                      className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                      title={t('common.edit')}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(program._id)}
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
                    {program.description}
                  </p>
                </div>

                {/* Footer */}
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-2 rounded-lg border border-blue-100">
                      <Calendar className="h-3 w-3 text-blue-500" />
                      <span className="text-gray-700 font-medium">
                        {formatDate(program.createdAt)}
                      </span>
                    </div>
                    <span className="text-gray-500 font-medium">
                      {program.createdBy?.username || 'Admin'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 text-white">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                    {modalType === 'create' && <Plus size={24} />}
                    {modalType === 'edit' && <Edit2 size={24} />}
                    {modalType === 'view' && <Eye size={24} />}
                  </div>
                  {modalType === 'create' && t('programs.modal.create')}
                  {modalType === 'edit' && t('programs.modal.edit')}
                  {modalType === 'view' && t('programs.modal.view')}
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
                  {selectedProgram?.image?.data && (
                    <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-xl">
                      <img
                        src={selectedProgram.image.data}
                        alt={selectedProgram.name}
                        className="max-w-full h-64 object-contain mx-auto rounded-xl shadow-lg"
                      />
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-100">
                      <label className="block text-sm font-bold text-gray-700 mb-2">{t('programs.form.programName')}</label>
                      <p className="text-gray-900 font-semibold text-xl">{selectedProgram?.name}</p>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-xl border border-green-100">
                      <label className="block text-sm font-bold text-gray-700 mb-2">{t('programs.form.description')}</label>
                      <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{selectedProgram?.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
                        <label className="block text-sm font-bold text-gray-700 mb-2">{t('programs.form.status')}</label>
                        <span className={`inline-flex items-center gap-2 px-3 py-1 text-sm font-bold rounded-lg ${
                          selectedProgram?.isActive 
                            ? 'bg-green-500 text-white' 
                            : 'bg-red-500 text-white'
                        }`}>
                          {selectedProgram?.isActive ? t('programs.status.active') : t('programs.status.inactive')}
                        </span>
                      </div>
                      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-xl border border-yellow-100">
                        <label className="block text-sm font-bold text-gray-700 mb-2">{t('programs.form.created')}</label>
                        <p className="text-sm text-gray-900 font-medium">
                          {formatDate(selectedProgram?.createdAt)}
                        </p>
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
                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-gray-700">
                      {t('programs.form.programImage')} {modalType === 'create' && '*'}
                    </label>
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-48 border-3 border-blue-300 border-dashed rounded-2xl cursor-pointer bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all duration-300">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-10 h-10 mb-3 text-blue-500" />
                          <p className="mb-2 text-sm text-gray-700 font-semibold">
                            <span className="text-blue-600">{t('programs.form.clickToUpload')}</span>
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

                  {/* Form Fields */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">{t('programs.form.programName')} *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder={t('programs.form.namePlaceholder')}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">{t('programs.form.description')} *</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        placeholder={t('programs.form.descriptionPlaceholder')}
                        rows={6}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 border-2 border-gray-300 rounded-xl font-semibold transition-all duration-200"
                    >
                      {t('programs.form.cancel')}
                    </button>
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <Save size={18} />
                      {modalType === 'create' ? t('programs.form.create') : t('programs.form.update')}
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

export default Programs;
