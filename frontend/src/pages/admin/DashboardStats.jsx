import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Megaphone, 
  ImageIcon, 
  Award, 
  Users, 
  MessageSquare 
} from 'lucide-react';
import { adminAPI } from '../../services/api';

const DashboardStats = () => {
  const { t } = useTranslation('admin');
  const [stats, setStats] = useState({
    announcements: 0,
    gallery: 0,
    awards: 0,
    members: 0,
    feedback: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [announcements, gallery, awards, members, feedback] = await Promise.all([
          adminAPI.getAnnouncements(),
          adminAPI.getGallery(),
          adminAPI.getAwards(),
          adminAPI.getMembers(),
          adminAPI.getFeedback({ status: 'pending' })
        ]);

        setStats({
          announcements: announcements.data.count || 0,
          gallery: gallery.data.count || 0,
          awards: awards.data.count || 0,
          members: members.data.count || 0,
          feedback: feedback.data.count || 0
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  const statItems = [
    {
      title: t('dashboard.stats.totalAnnouncements'),
      value: stats.announcements,
      icon: Megaphone,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      title: t('dashboard.stats.totalGallery'),
      value: stats.gallery,
      icon: ImageIcon,
      color: 'bg-green-500',
      bgColor: 'bg-green-50'
    },
    {
      title: t('dashboard.stats.totalAwards'),
      value: stats.awards,
      icon: Award,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50'
    },
    {
      title: t('dashboard.stats.totalMembers'),
      value: stats.members,
      icon: Users,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50'
    },
    {
      title: t('dashboard.stats.pendingFeedback'),
      value: stats.feedback,
      icon: MessageSquare,
      color: 'bg-red-500',
      bgColor: 'bg-red-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      {statItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <div key={index} className={`${item.bgColor} rounded-xl p-6 border border-gray-200`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {item.title}
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {item.value}
                </p>
              </div>
              <div className={`${item.color} p-3 rounded-lg`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardStats;
