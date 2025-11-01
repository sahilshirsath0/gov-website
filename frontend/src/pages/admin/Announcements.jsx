import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  Search, 
  Filter,
  MessageSquare,
  X,
  Save
} from 'lucide-react';
import { adminAPI } from '../../services/api';

const Announcements = () => {
  const { t } = useTranslation('admin');
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    message: ''
  });
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAnnouncements();
      setAnnouncements(response.data.data || []);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setModalType('create');
    setSelectedAnnouncement(null);
    setFormData({ message: '' });
    setSubmitError('');
    setShowModal(true);
  };

  const handleEdit = (announcement) => {
    setModalType('edit');
    setSelectedAnnouncement(announcement);
    setFormData({
      message: announcement.message
    });
    setSubmitError('');
    setShowModal(true);
  };

  const handleView = (announcement) => {
    setModalType('view');
    setSelectedAnnouncement(announcement);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('announcements.confirmDelete'))) {
      try {
        await adminAPI.deleteAnnouncement(id);
        fetchAnnouncements();
      } catch (error) {
        console.error('Error deleting announcement:', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!formData.message.trim()) {
      setSubmitError('Message is required');
      return;
    }

    try {
      const submitData = {
        message: formData.message.trim()
      };

      if (modalType === 'create') {
        await adminAPI.createAnnouncement(submitData);
      } else {
        await adminAPI.updateAnnouncement(selectedAnnouncement._id, {
          message: formData.message.trim(),
          isActive: true
        });
      }

      setShowModal(false);
      fetchAnnouncements();
      setFormData({ message: '' });
    } catch (error) {
      console.error('Error submitting announcement:', error);
      setSubmitError(error.response?.data?.message || 'Error submitting announcement');
    }
  };

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = announcement.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
      (filterStatus === 'active' && announcement.isActive) ||
      (filterStatus === 'inactive' && !announcement.isActive);
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

  const truncateMessage = (message, maxLength = 120) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
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
            {t('announcements.title')}
          </h1>
          <p className="text-gray-600">
            {t('announcements.subtitle')}
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
        >
          <Plus size={20} />
          {t('announcements.create')}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder={t('announcements.search')}
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
              <option value="all">{t('announcements.filter.all')}</option>
              <option value="active">{t('announcements.filter.active')}</option>
              <option value="inactive">{t('announcements.filter.inactive')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Announcements Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredAnnouncements.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-400 mb-4">
              <MessageSquare size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t('announcements.empty.title')}
            </h3>
            <p className="text-gray-600 mb-4">
              {t('announcements.empty.description')}
            </p>
            <button
              onClick={handleCreate}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2"
            >
              <Plus size={20} />
              {t('announcements.create')}
            </button>
          </div>
        ) : (
          filteredAnnouncements.map((announcement) => (
            <div key={announcement._id} className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow duration-200">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    announcement.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {announcement.isActive ? t('announcements.status.active') : t('announcements.status.inactive')}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleView(announcement)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleEdit(announcement)}
                      className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(announcement._id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Message */}
                <div className="mb-4">
                  <p className="text-gray-900 text-sm leading-relaxed">
                    {truncateMessage(announcement.message)}
                  </p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100">
                  <span>{t('announcements.createdBy')}: {announcement.createdBy?.username}</span>
                  <span>{formatDate(announcement.createdAt)}</span>
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
                {modalType === 'create' && t('announcements.modal.create')}
                {modalType === 'edit' && t('announcements.modal.edit')}
                {modalType === 'view' && t('announcements.modal.view')}
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('announcements.form.message')}
                    </label>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                        {selectedAnnouncement?.message}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('announcements.form.status')}
                      </label>
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                        selectedAnnouncement?.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedAnnouncement?.isActive ? t('announcements.status.active') : t('announcements.status.inactive')}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('announcements.form.created')}
                      </label>
                      <p className="text-sm text-gray-900">
                        {formatDate(selectedAnnouncement?.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('announcements.form.createdBy')}
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedAnnouncement?.createdBy?.username}
                    </p>
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
                      {t('announcements.form.message')} *
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      placeholder={t('announcements.form.messagePlaceholder')}
                      rows={8}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      {t('announcements.form.cancel')}
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
                    >
                      <Save size={16} />
                      {modalType === 'create' ? t('announcements.form.create') : t('announcements.form.update')}
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

export default Announcements;
