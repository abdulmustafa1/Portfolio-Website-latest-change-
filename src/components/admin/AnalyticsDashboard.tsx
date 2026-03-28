import React, { useState, useEffect } from 'react';
import { BarChart3, Eye, MousePointer, TrendingUp, Image } from 'lucide-react';
import { supabase, SiteAnalytics, PortfolioClick, PortfolioItem } from '../../lib/supabase';

interface AnalyticsData {
  totalVisits: number;
  todayVisits: number;
  totalClicks: number;
  topItems: Array<{
    item: PortfolioItem;
    clicks: number;
  }>;
}

const AnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalVisits: 0,
    todayVisits: 0,
    totalClicks: 0,
    topItems: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Fetch site analytics
      const { data: siteData, error: siteError } = await supabase
        .from('site_analytics')
        .select('*');

      if (siteError) throw siteError;

      // Calculate total visits and today's visits
      const totalVisits = siteData?.reduce((sum, record) => sum + record.visit_count, 0) || 0;
      const todayRecord = siteData?.find(record => record.visit_date === today);
      const todayVisits = todayRecord?.visit_count || 0;

      // Fetch portfolio clicks with item details
      const { data: clicksData, error: clicksError } = await supabase
        .from('portfolio_clicks')
        .select('*, portfolio_item:portfolio_items(*, category:categories(*))')
        .order('click_count', { ascending: false })
        .limit(10);

      if (clicksError) throw clicksError;

      // Calculate total clicks
      const totalClicks = clicksData?.reduce((sum, record) => sum + record.click_count, 0) || 0;

      // Format top items
      const topItems = (clicksData || []).map(click => ({
        item: click.portfolio_item,
        clicks: click.click_count,
      }));

      setAnalytics({
        totalVisits,
        todayVisits,
        totalClicks,
        topItems,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Analytics Dashboard</h1>
        <p className="text-gray-400">Track site visits and portfolio engagement</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700
                     transform transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">{analytics.totalVisits.toLocaleString()}</p>
            <p className="text-sm text-gray-400">Total Site Visits</p>
            <p className="text-xs text-green-400 mt-1">+{analytics.todayVisits} today</p>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700
                     transform transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <MousePointer className="w-6 h-6 text-white" />
            </div>
            <BarChart3 className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">{analytics.totalClicks.toLocaleString()}</p>
            <p className="text-sm text-gray-400">Portfolio Clicks</p>
            <p className="text-xs text-purple-400 mt-1">All time</p>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700
                     transform transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center">
              <Image className="w-6 h-6 text-white" />
            </div>
            <TrendingUp className="w-5 h-5 text-teal-400" />
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">{analytics.topItems.length}</p>
            <p className="text-sm text-gray-400">Items with Clicks</p>
            <p className="text-xs text-teal-400 mt-1">Tracked items</p>
          </div>
        </div>
      </div>

      {/* Top Portfolio Items */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-teal-400" />
          Most Clicked Portfolio Items
        </h2>

        {analytics.topItems.length > 0 ? (
          <div className="space-y-4">
            {analytics.topItems.map((item, index) => (
              <div
                key={item.item.id}
                className="flex items-center space-x-4 p-4 bg-gray-700/30 rounded-lg
                         hover:bg-gray-700/50 transition-colors duration-300"
              >
                <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-teal-500 to-purple-600 
                               rounded-full text-white font-bold text-sm">
                  {index + 1}
                </div>
                
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-600 flex-shrink-0">
                  <img
                    src={item.item.file_url}
                    alt={item.item.title || 'Portfolio item'}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-white truncate">
                    {item.item.title || 'Untitled'}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {item.item.category?.name || 'No category'}
                  </p>
                </div>
                
                <div className="text-right">
                  <p className="text-lg font-bold text-teal-400">{item.clicks}</p>
                  <p className="text-xs text-gray-400">clicks</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <MousePointer className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">No clicks yet</h3>
            <p className="text-gray-500">Portfolio item clicks will appear here once users start engaging with your content</p>
          </div>
        )}
      </div>

      {/* Refresh Button */}
      <div className="flex justify-center">
        <button
          onClick={fetchAnalytics}
          className="px-6 py-3 bg-gradient-to-r from-teal-500 to-purple-600 text-white font-semibold rounded-lg
                   hover:scale-105 transition-all duration-300 flex items-center space-x-2"
        >
          <BarChart3 className="w-5 h-5" />
          <span>Refresh Analytics</span>
        </button>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
