import React from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, User, Menu } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import LanguageToggle from '../../components/common/LanguageToggle';

const Header = ({ onToggleSidebar }) => {
  const { t } = useTranslation('admin');
  const { admin } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <Menu size={20} />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">
            {t('header.title')}
          </h1>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <LanguageToggle />
          
          {/* Notifications */}
          <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              3
            </span>
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg">
            <div className="bg-blue-600 p-2 rounded-full">
              <User className="h-4 w-4 text-white" />
            </div>
            <div className="text-sm">
              <p className="font-medium text-gray-900">{admin?.username}</p>
              <p className="text-gray-600">{t('header.role')}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
