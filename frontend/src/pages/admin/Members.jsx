import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  Search, 
  Filter,
  Users,
  X,
  Save,
  Upload,
  Mail,
  Phone,
  Briefcase
} from 'lucide-react';
import { adminAPI } from '../../services/api';

const Members = () => {
  const { t } = useTranslation('admin');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create');
  const [selectedMember, setSelectedMember] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    position: '',
    department: '',
    email: '',
    phone: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getMembers();
      setMembers(response.data.data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setModalType('create');
    setSelectedMember(null);
    setFormData({
      name: '',
      description: '',
      position: '',
      department: '',
      email: '',
      phone: ''
    });
    setSelectedFile(null);
    setPreviewUrl('');
    setSubmitError('');
    setShowModal(true);
  };

  const handleEdit = (member) => {
    setModalType('edit');
    setSelectedMember(member);
    setFormData({
      name: member.name,
      description: member.description || '',
      position: member.position || '',
      department: member.department || '',
      email: member.email || '',
      phone: member.phone || ''
    });
    setSelectedFile(null);
    setPreviewUrl('');
    setSubmitError('');
    setShowModal(true);
  };

  const handleView = (member) => {
    setModalType('view');
    setSelectedMember(member);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('members.confirmDelete'))) {
      try {
        await adminAPI.deleteMember(id);
        fetchMembers();
      } catch (error) {
        console.error('Error deleting member:', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!formData.name.trim() || !formData.description.trim()) {
      setSubmitError('Name and description are required');
      return;
    }

    try {
      if (modalType === 'create') {
        let submitData = {
          name: formData.name.trim(),
          description: formData.description.trim(),
          position: formData.position?.trim() || '',
          department: formData.department?.trim() || '',
          email: formData.email?.trim() || '',
          phone: formData.phone?.trim() || ''
        };

        // Add image data if file is selected
        if (selectedFile) {
          const base64Data = await convertFileToBase64(selectedFile);
          submitData.imageData = base64Data;
          submitData.contentType = selectedFile.type;
          submitData.filename = selectedFile.name;
          submitData.size = selectedFile.size;
        }

        await adminAPI.createMember(submitData);
      } else {
        await adminAPI.updateMember(selectedMember._id, {
          name: formData.name.trim(),
          description: formData.description.trim(),
          position: formData.position?.trim() || '',
          department: formData.department?.trim() || '',
          email: formData.email?.trim() || '',
          phone: formData.phone?.trim() || '',
          isActive: true
        });
      }

      setShowModal(false);
      fetchMembers();
      setFormData({
        name: '',
        description: '',
        position: '',
        department: '',
        email: '',
        phone: ''
      });
      setSelectedFile(null);
      setPreviewUrl('');
    } catch (error) {
      console.error('Error submitting member:', error);
      setSubmitError(error.response?.data?.message || 'Error submitting member');
    }
  };

  // Convert file to base64
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

      setSelectedFile(file);
      setSubmitError('');
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
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

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (member.description && member.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (member.position && member.position.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (member.department && member.department.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterStatus === 'all' || 
      (filterStatus === 'active' && member.isActive) ||
      (filterStatus === 'inactive' && !member.isActive);
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getImageUrl = (member) => {
    if (member.image && member.image.data) {
      return member.image.data; // This is already a data URL
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
            {t('members.title')}
          </h1>
          <p className="text-gray-600">
            {t('members.subtitle')}
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
        >
          <Plus size={20} />
          {t('members.create')}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder={t('members.search')}
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
              <option value="all">{t('members.filter.all')}</option>
              <option value="active">{t('members.filter.active')}</option>
              <option value="inactive">{t('members.filter.inactive')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-400 mb-4">
              <Users size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t('members.empty.title')}
            </h3>
            <p className="text-gray-600 mb-4">
              {t('members.empty.description')}
            </p>
            <button
              onClick={handleCreate}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2"
            >
              <Plus size={20} />
              {t('members.create')}
            </button>
          </div>
        ) : (
          filteredMembers.map((member) => (
            <div key={member._id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200">
              {/* Profile Image */}
              <div className="relative h-48 bg-gray-100">
                {getImageUrl(member) ? (
                  <img
                    src={getImageUrl(member)}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Users size={48} />
                  </div>
                )}
                
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    member.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {member.isActive ? t('members.status.active') : t('members.status.inactive')}
                  </span>
                </div>

                <div className="absolute top-2 left-2 flex gap-1">
                  <button
                    onClick={() => handleView(member)}
                    className="bg-white text-gray-900 p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
                  >
                    <Eye size={14} />
                  </button>
                  <button
                    onClick={() => handleEdit(member)}
                    className="bg-white text-gray-900 p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(member._id)}
                    className="bg-white text-gray-900 p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-medium text-gray-900 mb-1">{member.name}</h3>
                
                {member.position && (
                  <div className="flex items-center gap-1 mb-2">
                    <Briefcase size={14} className="text-gray-400" />
                    <span className="text-sm text-gray-600">{member.position}</span>
                  </div>
                )}

                {member.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {member.description}
                  </p>
                )}

                <div className="space-y-1">
                  {member.email && (
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-gray-400" />
                      <span className="text-xs text-gray-600">{member.email}</span>
                    </div>
                  )}
                  
                  {member.phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-gray-400" />
                      <span className="text-xs text-gray-600">{member.phone}</span>
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                  <p>{t('members.createdBy')}: {member.createdBy?.username}</p>
                  <p>{formatDate(member.createdAt)}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {modalType === 'create' && t('members.modal.create')}
                {modalType === 'edit' && t('members.modal.edit')}
                {modalType === 'view' && t('members.modal.view')}
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
                  {getImageUrl(selectedMember) && (
                    <div className="text-center">
                      <img
                        src={getImageUrl(selectedMember)}
                        alt={selectedMember?.name}
                        className="w-32 h-32 object-cover rounded-full mx-auto border-4 border-gray-200"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('members.form.name')}
                      </label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                        {selectedMember?.name}
                      </p>
                    </div>

                    {selectedMember?.description && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('members.form.description')}
                        </label>
                        <p className="text-gray-900 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">
                          {selectedMember.description}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      {selectedMember?.position && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('members.form.position')}
                          </label>
                          <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                            {selectedMember.position}
                          </p>
                        </div>
                      )}
                      
                      {selectedMember?.department && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('members.form.department')}
                          </label>
                          <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                            {selectedMember.department}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {selectedMember?.email && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('members.form.email')}
                          </label>
                          <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                            {selectedMember.email}
                          </p>
                        </div>
                      )}
                      
                      {selectedMember?.phone && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('members.form.phone')}
                          </label>
                          <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                            {selectedMember.phone}
                          </p>
                        </div>
                      )}
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
                      {t('members.form.name')} *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder={t('members.form.namePlaceholder')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('members.form.description')} *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder={t('members.form.descriptionPlaceholder')}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('members.form.position')}
                      </label>
                      <input
                        type="text"
                        value={formData.position}
                        onChange={(e) => setFormData({...formData, position: e.target.value})}
                        placeholder={t('members.form.positionPlaceholder')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('members.form.department')}
                      </label>
                      <input
                        type="text"
                        value={formData.department}
                        onChange={(e) => setFormData({...formData, department: e.target.value})}
                        placeholder={t('members.form.departmentPlaceholder')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('members.form.email')}
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder={t('members.form.emailPlaceholder')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('members.form.phone')}
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder={t('members.form.phonePlaceholder')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {modalType === 'create' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('members.form.image')}
                      </label>
                      <div className="space-y-3">
                        <div className="flex items-center justify-center w-full">
                          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Upload className="w-8 h-8 mb-3 text-gray-400" />
                              <p className="mb-2 text-sm text-gray-500">
                                <span className="font-semibold">{t('members.form.clickToUpload')}</span>
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
                          <div className="relative text-center">
                            <img
                              src={previewUrl}
                              alt="Preview"
                              className="w-32 h-32 object-cover rounded-full mx-auto border-4 border-gray-200"
                            />
                            <button
                              type="button"
                              onClick={removeFile}
                              className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition-colors duration-200"
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
                      {t('members.form.cancel')}
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
                    >
                      <Save size={16} />
                      {modalType === 'create' ? t('members.form.create') : t('members.form.update')}
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

export default Members;
