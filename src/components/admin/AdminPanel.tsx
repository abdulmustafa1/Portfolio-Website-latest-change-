import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import AdminLogin from './AdminLogin';
import AdminLayout from './AdminLayout';
import Dashboard from './Dashboard';
import PortfolioManager from './PortfolioManager';
import CategoriesManager from './CategoriesManager';
import TagsManager from './TagsManager';
import TagPresetsManager from './TagPresetsManager';
import PrivateFormManager from './PrivateFormManager';
import ProgressTrackerManager from './ProgressTrackerManager';
import ABTestingManager from './ABTestingManager';
import AchievementsManager from './AchievementsManager';
import FAQsManager from './FAQsManager';
import AnalyticsDashboard from './AnalyticsDashboard';

const AdminPanel: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');

  useEffect(() => {
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    } catch (error) {
      console.error('Error checking auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setActiveSection('dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'portfolio':
        return <PortfolioManager />;
      case 'ab-testing':
        return <ABTestingManager />;
      case 'achievements':
      case 'reviews':
        return <AchievementsManager />;
      case 'faqs':
        return <FAQsManager />;
      case 'categories':
        return <CategoriesManager />;
      case 'tags':
        return <TagsManager />;
      case 'tag-presets':
        return <TagPresetsManager />;
      case 'private-forms':
        return <PrivateFormManager />;
      case 'progress-tracker':
        return <ProgressTrackerManager />;
      case 'analytics':
        return <AnalyticsDashboard />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AdminLayout
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      onLogout={handleLogout}
    >
      {renderContent()}
    </AdminLayout>
  );
};

export default AdminPanel;