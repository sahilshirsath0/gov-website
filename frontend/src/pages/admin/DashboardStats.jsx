// pages/admin/DashboardStats.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Megaphone, 
  ImageIcon, 
  Award, 
  Users, 
  MessageSquare,
  MapPin,
  FileText
} from 'lucide-react';
import { adminAPI } from '../../services/api';

const DashboardStats = () => {
  const { t } = useTranslation('admin');
  const [stats, setStats] = useState({
    announcements: 0,
    gallery: 0,
    awards: 0,
    members: 0,
    feedback: 0,
    nagrikSevaApplications: 0,
    programs: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [
          announcements, 
          gallery, 
          awards, 
          members, 
          feedback,
          nagrikSevaApplications,
          programs
        ] = await Promise.all([
          adminAPI.getAnnouncements().catch(() => ({ data: { data: [] } })),
          adminAPI.getGallery().catch(() => ({ data: { data: [] } })),
          adminAPI.getAwards().catch(() => ({ data: { data: [] } })),
          adminAPI.getMembers().catch(() => ({ data: { data: [] } })),
          adminAPI.getFeedback({ status: 'pending' }).catch(() => ({ data: { data: [] } })),
          adminAPI.getNagrikSevaApplications().catch(() => ({ data: { data: [] } })),
          adminAPI.getPrograms().catch(() => ({ data: { data: [] } }))
        ]);

        setStats({
          announcements: announcements.data.data?.length || 0,
          gallery: gallery.data.data?.length || 0,
          awards: awards.data.data?.length || 0,
          members: members.data.data?.length || 0,
          feedback: feedback.data.data?.length || 0,
          nagrikSevaApplications: nagrikSevaApplications.data.data?.length || 0,
          programs: programs.data.data?.length || 0
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  const statItems = [
    {
      title: t('dashboard.stats.totalAnnouncements') || 'Announcements',
      value: stats.announcements,
      icon: Megaphone,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-50 to-cyan-50'
    },
    {
      title: t('dashboard.stats.totalGallery') || 'Gallery Items',
      value: stats.gallery,
      icon: ImageIcon,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'from-green-50 to-emerald-50'
    },
    {
      title: 'नागरिक सेवा',
      value: stats.nagrikSevaApplications,
      icon: Users,
      color: 'from-purple-500 to-fuchsia-500',
      bgColor: 'from-purple-50 to-fuchsia-50'
    },
    {
      title: 'Programs',
      value: stats.programs,
      icon: Award,
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'from-yellow-50 to-orange-50'
    },
    {
      title: t('dashboard.stats.pendingFeedback') || 'Pending Feedback',
      value: stats.feedback,
      icon: MessageSquare,
      color: 'from-red-500 to-pink-500',
      bgColor: 'from-red-50 to-pink-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      {statItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <div key={index} className={`group relative overflow-hidden bg-gradient-to-br ${item.bgColor} rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-105`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-700 mb-2">
                  {item.title}
                </p>
                <p className="text-4xl font-black text-gray-900">
                  {item.value}
                </p>
              </div>
              <div className={`bg-gradient-to-r ${item.color} p-4 rounded-xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                <Icon className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardStats;
