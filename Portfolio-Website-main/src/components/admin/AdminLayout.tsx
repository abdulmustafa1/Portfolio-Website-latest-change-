import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Image, 
  TestTube, 
  Trophy, 
  MessageSquare, 
  HelpCircle, 
  Tags,
  BarChart3,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout: () => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ 
  children, 
  activeSection, 
  onSectionChange, 
  onLogout 
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'portfolio', label: 'Portfolio Manager', icon: Image },
    { id: 'categories', label: 'Categories Manager', icon: Tags },
    { id: 'tags', label: 'Tags Manager', icon: Tags },
    { id: 'tag-presets', label: 'Tag Presets', icon: Tags },
    { id: 'progress-tracker', label: 'Progress Tracker', icon: BarChart3 },
    { id: 'ab-testing', label: 'A/B Testing Manager', icon: TestTube },
    { id: 'achievements', label: 'Achievements & Reviews', icon: Trophy },
    { id: 'reviews', label: 'Reviews Manager', icon: MessageSquare },
    { id: 'faqs', label: 'FAQs Manager', icon: HelpCircle },
    { id: 'private-forms', label: 'Private Form Entries', icon: MessageSquare },
    { id: 'analytics', label: 'Analytics Dashboard', icon: BarChart3 },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-800 border-r border-gray-700
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h1 className="text-xl font-bold text-transparent bg-gradient-to-r from-teal-400 to-purple-500 bg-clip-text">
            Admin Panel
          </h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors duration-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      onSectionChange(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left
                             transition-all duration-300 ${
                      activeSection === item.id
                        ? 'bg-gradient-to-r from-teal-500/20 to-purple-500/20 text-teal-400 border border-teal-500/30'
                        : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-gray-300 hover:text-white
                     hover:bg-red-500/10 rounded-lg transition-all duration-300"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors duration-300"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <h2 className="text-xl font-semibold text-white capitalize">
              {activeSection.replace('-', ' ')}
            </h2>
            
            <div className="w-10 lg:w-0" /> {/* Spacer for mobile */}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;