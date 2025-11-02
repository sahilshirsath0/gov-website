// components/admin/NagrikSeva.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Plus, 
  Edit2, 
  Eye, 
  Search, 
  Filter,
  Users,
  X,
  Save,
  Upload,
  Calendar,
  Phone,
  Mail,
  User,
  FileText,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { adminAPI } from '../../services/api';

const NagrikSeva = () => {
  const { t } = useTranslation('admin');
  const [headerImage, setHeaderImage] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    fetchNagrikSevaData();
  }, []);

  const fetchNagrikSevaData = async () => {
    try {
      setLoading(true);
      const [headerResponse, applicationsResponse] = await Promise.all([
        adminAPI.getNagrikSevaHeader(),
        adminAPI.getNagrikSevaApplications()
      ]);
      setHeaderImage(headerResponse.data.data);
      setApplications(applicationsResponse.data.data || []);
    } catch (error) {
      console.error('Error fetching nagrik seva data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpdate = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setSubmitError('');
    setShowImageModal(true);
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

  const handleImageSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!selectedFile) {
      setSubmitError('Please select an image file');
      return;
    }

    try {
      const base64Data = await convertFileToBase64(selectedFile);
      const submitData = {
        imageData: base64Data,
        contentType: selectedFile.type,
        filename: selectedFile.name,
        size: selectedFile.size
      };

      await adminAPI.updateNagrikSevaHeader(submitData);
      setShowImageModal(false);
      fetchNagrikSevaData();
      setSelectedFile(null);
      setPreviewUrl('');
    } catch (error) {
      console.error('Error updating header image:', error);
      setSubmitError('Error updating image');
    }
  };

  const handleViewApplication = (application) => {
    setSelectedApplication(application);
    setShowApplicationModal(true);
  };

  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      await adminAPI.updateApplicationStatus(applicationId, { status: newStatus });
      fetchNagrikSevaData();
      setShowApplicationModal(false);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = (app.firstName + ' ' + app.lastName).toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.whatsappNumber.includes(searchTerm);
    const matchesFilter = filterStatus === 'all' || app.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'from-green-500 to-emerald-500';
      case 'rejected':
        return 'from-red-500 to-pink-500';
      default:
        return 'from-yellow-500 to-orange-500';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved':
        return t('nagrikSeva.applications.status.approved');
      case 'rejected':
        return t('nagrikSeva.applications.status.rejected');
      default:
        return t('nagrikSeva.applications.status.pending');
    }
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
                <Users className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{t('nagrikSeva.title')}</h1>
                <p className="text-blue-100 mt-1 text-sm">{t('nagrikSeva.subtitle')}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                <span className="font-semibold">{applications.length}</span> {t('nagrikSeva.applications.title')}
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                <span className="font-semibold">{applications.filter(app => app.status === 'pending').length}</span> {t('nagrikSeva.applications.status.pending')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Header Image Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-700 flex items-center gap-2">
              <FileText size={18} />
              {t('nagrikSeva.headerImage.title')}
            </h3>
            <button
              onClick={handleImageUpdate}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition-all duration-300"
            >
              <Edit2 size={16} />
              {t('nagrikSeva.headerImage.update')}
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="relative aspect-[16/6] bg-gradient-to-br from-gray-100 to-blue-100 rounded-xl overflow-hidden">
            {headerImage?.image?.data ? (
              <img
                src={headerImage.image.data}
                alt="Nagrik Seva Header"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <FileText size={48} className="text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">{t('nagrikSeva.headerImage.noImage')}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-3 border-b border-gray-200">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2">
            <Filter size={18} />
            {t('nagrikSeva.applications.search')} & {t('common.filter')}
          </h3>
        </div>
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors duration-200" size={20} />
              <input
                type="text"
                placeholder={t('nagrikSeva.applications.search')}
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
                <option value="all">{t('nagrikSeva.applications.filter.all')}</option>
                <option value="pending">{t('nagrikSeva.applications.filter.pending')}</option>
                <option value="approved">{t('nagrikSeva.applications.filter.approved')}</option>
                <option value="rejected">{t('nagrikSeva.applications.filter.rejected')}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Applications Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredApplications.length === 0 ? (
          <div className="col-span-full">
            <div className="bg-white rounded-2xl shadow-lg border-2 border-dashed border-gray-300 p-16 text-center">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users size={48} className="text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">{t('nagrikSeva.applications.empty.title')}</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">{t('nagrikSeva.applications.empty.description')}</p>
            </div>
          </div>
        ) : (
          filteredApplications.map((application) => (
            <div key={application._id} className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-2 rounded-full">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{application.firstName} {application.lastName}</h3>
                      <p className="text-xs text-gray-500">{application.certificateHolderName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-full bg-gradient-to-r ${getStatusColor(application.status)} text-white`}>
                      {getStatusIcon(application.status)}
                      {getStatusText(application.status)}
                    </span>
                    <button
                      onClick={() => handleViewApplication(application)}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                      title={t('nagrikSeva.applications.viewDetails')}
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700">{application.whatsappNumber}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700">{application.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700">DOB: {formatDate(application.dateOfBirth)}</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 px-2 py-1 rounded-md font-medium">
                      {t('nagrikSeva.form.appliedOn')}: {formatDate(application.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Image Update Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 text-white">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <Upload size={24} />
                  {t('nagrikSeva.headerImage.update')}
                </h2>
                <button
                  onClick={() => setShowImageModal(false)}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-200"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6">
              <form onSubmit={handleImageSubmit} className="space-y-6">
                {submitError && (
                  <div className="bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 text-red-700 px-5 py-4 rounded-xl">
                    {submitError}
                  </div>
                )}

                <div className="space-y-4">
                  <label className="block text-sm font-bold text-gray-700">
                    {t('nagrikSeva.headerImage.title')} *
                  </label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-48 border-3 border-blue-300 border-dashed rounded-2xl cursor-pointer bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all duration-300">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-10 h-10 mb-3 text-blue-500" />
                        <p className="mb-2 text-sm text-gray-700 font-semibold">
                          <span className="text-blue-600">{t('common.messages.selectFile')}</span>
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

                <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowImageModal(false)}
                    className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 border-2 border-gray-300 rounded-xl font-semibold transition-all duration-200"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <Save size={18} />
                    {t('nagrikSeva.headerImage.update')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Application Details Modal */}
      {showApplicationModal && selectedApplication && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 text-white">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <User size={24} />
                  {t('nagrikSeva.applications.viewDetails')}
                </h2>
                <button
                  onClick={() => setShowApplicationModal(false)}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-200"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2">{t('nagrikSeva.form.personalInfo')}</h3>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl">
                    <label className="block text-sm font-bold text-gray-700 mb-1">{t('nagrikSeva.form.fullName')}</label>
                    <p className="text-gray-900">{selectedApplication.firstName} {selectedApplication.middleName} {selectedApplication.lastName}</p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl">
                    <label className="block text-sm font-bold text-gray-700 mb-1">{t('nagrikSeva.form.whatsappNumber')}</label>
                    <p className="text-gray-900">{selectedApplication.whatsappNumber}</p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl">
                    <label className="block text-sm font-bold text-gray-700 mb-1">{t('nagrikSeva.form.email')}</label>
                    <p className="text-gray-900">{selectedApplication.email}</p>
                  </div>

                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-xl">
                    <label className="block text-sm font-bold text-gray-700 mb-1">{t('nagrikSeva.form.aadhaarNumber')}</label>
                    <p className="text-gray-900">{selectedApplication.aadhaarNumber}</p>
                  </div>
                </div>

                {/* Certificate & Dates */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2">{t('nagrikSeva.form.certificateInfo')}</h3>
                  
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-xl">
                    <label className="block text-sm font-bold text-gray-700 mb-1">{t('nagrikSeva.form.certificateHolderName')}</label>
                    <p className="text-gray-900">{selectedApplication.certificateHolderName}</p>
                  </div>

                  <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-4 rounded-xl">
                    <label className="block text-sm font-bold text-gray-700 mb-1">{t('nagrikSeva.form.dateOfBirth')}</label>
                    <p className="text-gray-900">{formatDate(selectedApplication.dateOfBirth)}</p>
                  </div>

                  {selectedApplication.dateOfRegistration && (
                    <div className="bg-gradient-to-br from-rose-50 to-pink-50 p-4 rounded-xl">
                      <label className="block text-sm font-bold text-gray-700 mb-1">{t('nagrikSeva.form.dateOfRegistration')}</label>
                      <p className="text-gray-900">{formatDate(selectedApplication.dateOfRegistration)}</p>
                    </div>
                  )}

                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-4 rounded-xl">
                    <label className="block text-sm font-bold text-gray-700 mb-1">{t('nagrikSeva.form.applicationStatus')}</label>
                    <span className={`inline-flex items-center gap-2 px-3 py-1 text-sm font-bold rounded-lg bg-gradient-to-r ${getStatusColor(selectedApplication.status)} text-white`}>
                      {getStatusIcon(selectedApplication.status)}
                      {getStatusText(selectedApplication.status).toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Screenshot */}
              {selectedApplication.paymentScreenshot?.data && (
                <div className="mt-6">
                  <h3 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">{t('nagrikSeva.form.paymentScreenshot')}</h3>
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-4 rounded-xl">
                    <img
                      src={selectedApplication.paymentScreenshot.data}
                      alt="Payment Screenshot"
                      className="max-w-full h-64 object-contain mx-auto rounded-lg border-2 border-gray-200"
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
                {selectedApplication.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleStatusUpdate(selectedApplication._id, 'rejected')}
                      className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-semibold transition-all duration-300"
                    >
                      <XCircle size={18} />
                      {t('nagrikSeva.applications.reject')}
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(selectedApplication._id, 'approved')}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-semibold transition-all duration-300"
                    >
                      <CheckCircle size={18} />
                      {t('nagrikSeva.applications.approve')}
                    </button>
                  </>
                )}
                <button
                  onClick={() => setShowApplicationModal(false)}
                  className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 border-2 border-gray-300 rounded-xl font-semibold transition-all duration-200"
                >
                  {t('common.close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NagrikSeva;
