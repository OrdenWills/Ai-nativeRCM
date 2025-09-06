import React from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  ClipboardDocumentCheckIcon,
  DocumentTextIcon,
  CodeBracketIcon,
  DocumentDuplicateIcon,
  CurrencyDollarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

const Sidebar = ({ isOpen, onClose, onLogout }) => {
  const { t } = useTranslation();

  const navigation = [
    { name: t('dashboard'), href: '/', icon: HomeIcon },
    { name: t('eligibility'), href: '/eligibility', icon: ClipboardDocumentCheckIcon },
    { name: t('priorAuth'), href: '/prior-auth', icon: DocumentTextIcon },
    { name: t('documentation'), href: '/clinical-docs', icon: DocumentDuplicateIcon },
    { name: t('coding'), href: '/medical-coding', icon: CodeBracketIcon },
    { name: t('claims'), href: '/claims', icon: DocumentDuplicateIcon },
    { name: t('remittance'), href: '/remittance', icon: CurrencyDollarIcon },
  ];

  const secondaryNavigation = [
    { name: t('settings'), href: '/settings', icon: Cog6ToothIcon },
    { name: t('logout'), href: '/logout', icon: ArrowRightOnRectangleIcon },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 bg-primary-600">
            <h1 className="text-xl font-bold text-white">AI-RCM Platform</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* Secondary navigation */}
          <div className="px-4 py-4 border-t border-gray-200">
            {secondaryNavigation.map((item) => (
              item.name === t('logout') ? (
                <button
                  key={item.name}
                  onClick={onLogout}
                  className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100"
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </button>
              ) : (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100"
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </NavLink>
              )
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
