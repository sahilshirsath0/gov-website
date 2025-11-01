import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Eye, 
  Search, 
  Filter,
  MessageSquare,
  X,
  Save,
  Mail,
  Phone,
  Calendar,
  User,
  Trash2
} from 'lucide-react';
import { adminAPI } from '../../services/api';

const Feedback = () => {
  const { t } = useTranslation('admin');
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [statusUpdate, setStatusUpdate] = useState({
    status: '',
    adminNotes: ''
  });

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getFeedback();
      setFeedback(response.data.data || []);
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (item) => {
    setSelectedFeedback(item);
    setStatusUpdate({
      status: item.status,
      adminNotes: item.adminNotes || ''
    });
    setShowModal(true);
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.updateFeedbackStatus(selectedFeedback._id, statusUpdate);
      setShowModal(false);
      fetchFeedback();
    } catch (error) {
      console.error('Error updating feedback status:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('feedback.confirmDelete'))) {
      try {
        await adminAPI.deleteFeedback(id);
        fetchFeedback();
      } catch (error) {
        console.error('Error deleting feedback:', error);
      }
    }
  };

  const filteredFeedback = feedback.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || item.status === filterStatus;
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
            {t('feedback.title')}
          </h1>
          <p className="text-gray-600">
            {t('feedback.subtitle')}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder={t('feedback.search')}
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
              <option value="all">{t('feedback.filter.all')}</option>
              <option value="pending">{t('feedback.filter.pending')}</option>
              <option value="reviewed">{t('feedback.filter.reviewed')}</option>
              <option value="resolved">{t('feedback.filter.resolved')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Feedback List */}
      <div className="space-y-4">
        {filteredFeedback.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <MessageSquare size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t('feedback.empty.title')}
            </h3>
            <p className="text-gray-600">
              {t('feedback.empty.description')}
            </p>
          </div>
        ) : (
          filteredFeedback.map((item) => (
            <div key={item._id} className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow duration-200">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-gray-900">{item.subject}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                        {t(`feedback.status.${item.status}`)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <User size={14} />
                        <span>{item.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Mail size={14} />
                        <span>{item.email}</span>
                      </div>
                      {item.phone && (
                        <div className="flex items-center gap-1">
                          <Phone size={14} />
                          <span>{item.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleView(item)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Message Preview */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-gray-700 line-clamp-3">{item.message}</p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>{formatDate(item.createdAt)}</span>
                  </div>
                  {item.reviewedBy && (
                    <span>Reviewed by: {item.reviewedBy.username}</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* View Modal */}
      {showModal && selectedFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {t('feedback.modal.view')}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* User Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  {t('feedback.details.userInfo')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {t('feedback.form.name')}
                    </label>
                    <p className="text-gray-900">{selectedFeedback.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {t('feedback.form.email')}
                    </label>
                    <p className="text-gray-900">{selectedFeedback.email}</p>
                  </div>
                  {selectedFeedback.phone && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        {t('feedback.form.phone')}
                      </label>
                      <p className="text-gray-900">{selectedFeedback.phone}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {t('feedback.form.submitted')}
                    </label>
                    <p className="text-gray-900">{formatDate(selectedFeedback.createdAt)}</p>
                  </div>
                </div>
              </div>

              {/* Feedback Details */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  {t('feedback.details.feedbackDetails')}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('feedback.form.subject')}
                    </label>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                      {selectedFeedback.subject}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('feedback.form.message')}
                    </label>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-900 whitespace-pre-wrap">
                        {selectedFeedback.message}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Admin Section */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  {t('feedback.details.adminSection')}
                </h3>
                <form onSubmit={handleStatusUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('feedback.form.status')}
                    </label>
                    <select
                      value={statusUpdate.status}
                      onChange={(e) => setStatusUpdate({...statusUpdate, status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="pending">{t('feedback.status.pending')}</option>
                      <option value="reviewed">{t('feedback.status.reviewed')}</option>
                      <option value="resolved">{t('feedback.status.resolved')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('feedback.form.adminNotes')}
                    </label>
                    <textarea
                      value={statusUpdate.adminNotes}
                      onChange={(e) => setStatusUpdate({...statusUpdate, adminNotes: e.target.value})}
                      placeholder={t('feedback.form.adminNotesPlaceholder')}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {selectedFeedback.reviewedBy && (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          {t('feedback.form.reviewedBy')}
                        </label>
                        <p className="text-gray-900">{selectedFeedback.reviewedBy.username}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          {t('feedback.form.reviewedAt')}
                        </label>
                        <p className="text-gray-900">{formatDate(selectedFeedback.reviewedAt)}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      {t('feedback.form.cancel')}
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
                    >
                      <Save size={16} />
                      {t('feedback.form.updateStatus')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Feedback;
