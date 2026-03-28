import React, { useState, useEffect } from 'react';
import { Image, TestTube, Trophy, MessageSquare, HelpCircle, Tags } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    portfolioItems: 0,
    abTests: 0,
    achievements: 0,
    reviews: 0,
    faqs: 0,
    categories: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [
        portfolioResult,
        abTestsResult,
        achievementsResult,
        reviewsResult,
        faqsResult,
        categoriesResult,
      ] = await Promise.all([
        supabase.from('portfolio_items').select('id', { count: 'exact' }),
        supabase.from('ab_tests').select('id', { count: 'exact' }),
        supabase.from('achievements').select('id', { count: 'exact' }),
        supabase.from('reviews').select('id', { count: 'exact' }),
        supabase.from('faqs').select('id', { count: 'exact' }),
        supabase.from('categories').select('id', { count: 'exact' }),
      ]);

      setStats({
        portfolioItems: portfolioResult.count || 0,
        abTests: abTestsResult.count || 0,
        achievements: achievementsResult.count || 0,
        reviews: reviewsResult.count || 0,
        faqs: faqsResult.count || 0,
        categories: categoriesResult.count || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const statCards = [
    {
      title: 'Portfolio Items',
      value: stats.portfolioItems,
      icon: Image,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'A/B Tests',
      value: stats.abTests,
      icon: TestTube,
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Achievements',
      value: stats.achievements,
      icon: Trophy,
      color: 'from-yellow-500 to-orange-500',
    },
    {
      title: 'Reviews',
      value: stats.reviews,
      icon: MessageSquare,
      color: 'from-green-500 to-teal-500',
    },
    {
      title: 'FAQs',
      value: stats.faqs,
      icon: HelpCircle,
      color: 'from-indigo-500 to-purple-500',
    },
    {
      title: 'Categories',
      value: stats.categories,
      icon: Tags,
      color: 'from-pink-500 to-rose-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Overview of your portfolio content</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700
                       transform transition-all duration-300 hover:scale-105 hover:border-gray-600"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${card.color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">{card.value}</p>
                  <p className="text-sm text-gray-400">{card.title}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button className="p-4 bg-gradient-to-r from-teal-500/20 to-purple-500/20 border border-teal-500/30 
                           rounded-lg text-left hover:from-teal-500/30 hover:to-purple-500/30 transition-all duration-300">
            <h3 className="font-semibold text-teal-400 mb-1">Add Portfolio Item</h3>
            <p className="text-sm text-gray-400">Upload new thumbnails or branding</p>
          </button>
          
          <button className="p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 
                           rounded-lg text-left hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-300">
            <h3 className="font-semibold text-purple-400 mb-1">Create A/B Test</h3>
            <p className="text-sm text-gray-400">Add new thumbnail comparison</p>
          </button>
          
          <button className="p-4 bg-gradient-to-r from-green-500/20 to-teal-500/20 border border-green-500/30 
                           rounded-lg text-left hover:from-green-500/30 hover:to-teal-500/30 transition-all duration-300">
            <h3 className="font-semibold text-green-400 mb-1">Add Review</h3>
            <p className="text-sm text-gray-400">Include client testimonial</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;