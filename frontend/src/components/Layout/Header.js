import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import {
  Bars3Icon,
  BellIcon,
  UserCircleIcon,
  LanguageIcon,
} from '@heroicons/react/24/outline';

const Header = ({ onMenuClick }) => {
  const { t, i18n } = useTranslation();
  const location = useLocation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
    document.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  };

  // Get page title based on current route
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
      case '/dashboard':
        return t('dashboard');
      case '/eligibility':
        return t('eligibility');
      case '/claims':
        return t('claims');
      case '/prior-auth':
        return t('priorAuth');
      case '/clinical-docs':
        return t('documentation');
      case '/medical-coding':
        return t('coding');
      case '/remittance':
        return t('remittance');
      case '/settings':
        return t('settings');
      default:
        return t('');
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left side */}
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 lg:hidden"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>
          <h2 className="ml-4 text-lg font-semibold text-gray-900 lg:ml-0">
            {getPageTitle()}
          </h2>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Language toggle */}
          <button
            onClick={toggleLanguage}
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            title="Toggle Language"
          >
            <LanguageIcon className="w-5 h-5" />
          </button>

          {/* Notifications */}
          <button className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100">
            <BellIcon className="w-5 h-5" />
          </button>

          {/* User menu */}
          <div className="relative">
            <button className="flex items-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100">
              <UserCircleIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;