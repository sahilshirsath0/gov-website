import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  Megaphone, 
  ImageIcon, 
  Award, 
  Users, 
  MessageSquare,
  FileText,
  ArrowRight,
  Calendar,
  TrendingUp
} from 'lucide-react';
import DashboardStats from './DashboardStats';

const AdminDashboard = () => {
  const { t } = useTranslation('admin');

  const quickActions = [
    {
      title: t('dashboard.quickActions.announcements'),
      description: t('dashboard.quickActions.announcementsDesc'),
      icon: Megaphone,
      path: '/admin-dashboard/announcements',
      color: 'bg-blue-500'
    },
    {
      title: t('dashboard.quickActions.gallery'),
      description: t('dashboard.quickActions.galleryDesc'),
      icon: ImageIcon,
      path: '/admin-dashboard/gallery',
      color: 'bg-green-500'
    },
    {
      title: t('dashboard.quickActions.awards'),
      description: t('dashboard.quickActions.awardsDesc'),
      icon: Award,
      path: '/admin-dashboard/awards',
      color: 'bg-yellow-500'
    },
    {
      title: t('dashboard.quickActions.members'),
      description: t('dashboard.quickActions.membersDesc'),
      icon: Users,
      path: '/admin-dashboard/members',
      color: 'bg-purple-500'
    },
    {
      title: t('dashboard.quickActions.feedback'),
      description: t('dashboard.quickActions.feedbackDesc'),
      icon: MessageSquare,
      path: '/admin-dashboard/feedback',
      color: 'bg-red-500'
    },
    {
      title: t('dashboard.quickActions.documents'),
      description: t('dashboard.quickActions.documentsDesc'),
      icon: FileText,
      path: '#',
      color: 'bg-indigo-500'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {t('dashboard.welcome')}
            </h1>
            <p className="text-blue-100 text-lg">
              {t('dashboard.subtitle')}
            </p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white/20 p-4 rounded-lg">
              <Calendar className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <DashboardStats />

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Link
              key={index}
              to={action.path}
              className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all duration-200 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`${action.color} p-3 rounded-lg group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors duration-200" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                {action.title}
              </h3>
              <p className="text-gray-600 text-sm">
                {action.description}
              </p>
            </Link>
          );
        })}
      </div>

      {/* Recent Activity & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {t('dashboard.recentActivity.title')}
            </h2>
            <TrendingUp className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="bg-blue-500 p-2 rounded-full">
                <Megaphone className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {t('dashboard.recentActivity.noAnnouncements')}
                </p>
                <p className="text-xs text-gray-600">
                  {t('dashboard.recentActivity.today')}
                </p>
              </div>
            </div>
            <div className="text-center py-8 text-gray-500">
              <p>{t('dashboard.recentActivity.empty')}</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {t('dashboard.quickStats.title')}
            </h2>
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="bg-green-500 p-2 rounded-full">
                  <Users className="h-4 w-4 text-white" />
                </div>
                <span className="font-medium text-gray-900">
                  {t('dashboard.quickStats.totalMembers')}
                </span>
              </div>
              <span className="text-2xl font-bold text-gray-900">0</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-500 p-2 rounded-full">
                  <Award className="h-4 w-4 text-white" />
                </div>
                <span className="font-medium text-gray-900">
                  {t('dashboard.quickStats.totalAwards')}
                </span>
              </div>
              <span className="text-2xl font-bold text-gray-900">0</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="bg-red-500 p-2 rounded-full">
                  <MessageSquare className="h-4 w-4 text-white" />
                </div>
                <span className="font-medium text-gray-900">
                  {t('dashboard.quickStats.pendingFeedback')}
                </span>
              </div>
              <span className="text-2xl font-bold text-gray-900">0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
