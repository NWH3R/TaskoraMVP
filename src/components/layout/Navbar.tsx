import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  CheckSquare,
  Users,
  Trophy,
  BarChart3,
  CreditCard,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  Globe,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { useSubscription } from '../../hooks/useSubscription';

export const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { activePlan } = useSubscription();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const navigation = [
    { name: t('navigation.dashboard'), href: '/dashboard', icon: LayoutDashboard },
    { name: t('navigation.tasks'), href: '/tasks', icon: CheckSquare },
    { name: t('navigation.tribes'), href: '/tribes', icon: Users },
    { name: t('navigation.achievements'), href: '/achievements', icon: Trophy },
    { name: t('navigation.analytics'), href: '/analytics', icon: BarChart3 },
  ];

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'zh', name: '中文' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-md flex items-center justify-center transform -skew-x-12">
                <CheckSquare className="w-5 h-5 text-white transform skew-x-12" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Taskora
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
                    ${isActive(item.href)
                      ? 'bg-blue-100 text-blue-700 transform -skew-x-6'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 hover:transform hover:-skew-x-3'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            
            {/* Pricing Link - Always visible */}
            <Link
              to="/pricing"
              className={`
                flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
                ${isActive('/pricing')
                  ? 'bg-blue-100 text-blue-700 transform -skew-x-6'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 hover:transform hover:-skew-x-3'
                }
              `}
            >
              <CreditCard className="w-4 h-4" />
              <span>{t('navigation.pricing')}</span>
            </Link>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <div className="relative">
              <select
                value={i18n.language}
                onChange={(e) => i18n.changeLanguage(e.target.value)}
                className="appearance-none bg-transparent border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
              <Globe className="w-4 h-4 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400" />
            </div>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-md flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              </button>

              {isProfileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50"
                >
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                    <p className="text-xs text-gray-500">Plan: {activePlan.name}</p>
                  </div>
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <User className="w-4 h-4" />
                    <span>{t('common.profile')}</span>
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Settings className="w-4 h-4" />
                    <span>{t('common.settings')}</span>
                  </Link>
                  <button
                    onClick={signOut}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t('common.logout')}</span>
                  </button>
                </motion.div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-white border-t border-gray-200"
        >
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium
                    ${isActive(item.href)
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }
                  `}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            
            {/* Pricing Link - Mobile */}
            <Link
              to="/pricing"
              className={`
                flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium
                ${isActive('/pricing')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }
              `}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <CreditCard className="w-5 h-5" />
              <span>{t('navigation.pricing')}</span>
            </Link>
          </div>
        </motion.div>
      )}
    </nav>
  );
};