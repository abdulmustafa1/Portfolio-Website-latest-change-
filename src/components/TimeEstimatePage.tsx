import React, { useState, useEffect } from 'react';
import { Clock, ArrowLeft, Zap, Timer, AlertCircle } from 'lucide-react';
import { supabase, ProgressTracker } from '../lib/supabase';

const TimeEstimatePage: React.FC = () => {
  const [progressData, setProgressData] = useState<ProgressTracker | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgressData();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('progress_tracker_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'progress_tracker' },
        () => {
          fetchProgressData();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProgressData = async () => {
    try {
      const { data, error } = await supabase
        .from('progress_tracker')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setProgressData(data);
    } catch (error) {
      console.error('Error fetching progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEstimateData = (thumbnailsInProgress: number) => {
    if (thumbnailsInProgress <= 5) {
      return {
        time: '24 hours',
        color: 'from-green-400 to-emerald-500',
        bgColor: 'bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-green-600/10',
        icon: Zap,
        status: 'Fast Track',
        description: 'Your thumbnail will be prioritized and delivered quickly!'
      };
    } else if (thumbnailsInProgress <= 10) {
      return {
        time: '30 hours',
        color: 'from-yellow-400 to-amber-500',
        bgColor: 'bg-gradient-to-br from-yellow-500/10 via-amber-500/5 to-yellow-600/10',
        icon: Timer,
        status: 'Standard',
        description: 'Your thumbnail is in the standard delivery queue.'
      };
    } else if (thumbnailsInProgress <= 15) {
      return {
        time: '48 hours',
        color: 'from-orange-400 to-red-500',
        bgColor: 'bg-gradient-to-br from-orange-500/10 via-red-500/5 to-orange-600/10',
        icon: Clock,
        status: 'Busy Period',
        description: 'We\'re experiencing higher demand, but your thumbnail is queued.'
      };
    } else {
      return {
        time: '72 hours',
        color: 'from-red-400 to-red-600',
        bgColor: 'bg-gradient-to-br from-red-500/10 via-red-600/5 to-red-700/10',
        icon: AlertCircle,
        status: 'High Demand',
        description: 'We\'re working through a busy period. Thank you for your patience!'
      };
    }
  };

  const getLastUpdated = (updatedAt: string) => {
    const now = new Date();
    const updated = new Date(updatedAt);
    const diffInMinutes = Math.floor((now.getTime() - updated.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  const goBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400"></div>
      </div>
    );
  }

  const thumbnailsInProgress = progressData?.thumbnails_in_progress || 0;
  const estimateData = getEstimateData(thumbnailsInProgress);
  const Icon = estimateData.icon;

  return (
    <div className={`min-h-screen bg-gray-900 relative overflow-hidden`}>
      <div className={`absolute inset-0 ${estimateData.bgColor}`}></div>

      {/* Back Button */}
      <button
        onClick={goBack}
        className="fixed top-6 left-6 p-3 text-gray-400 hover:text-white transition-colors duration-300
                   bg-gray-800/50 backdrop-blur-sm rounded-full border border-gray-700 hover:border-teal-500 z-50"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      {/* Main Content */}
      <div className="min-h-screen flex items-center justify-center px-4 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          {/* Icon and Status */}
          <div className="mb-8">
            <div className={`w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r ${estimateData.color} 
                           flex items-center justify-center shadow-2xl animate-pulse`}>
              <Icon className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              <span className={`text-transparent bg-gradient-to-r ${estimateData.color} bg-clip-text`}>
                {estimateData.time}
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-2">
              Estimated Delivery Time
            </p>
            <div className={`inline-block px-4 py-2 rounded-full bg-gradient-to-r ${estimateData.color} 
                           text-white font-semibold text-sm`}>
              {estimateData.status}
            </div>
          </div>

          {/* Description Card */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 shadow-2xl mb-8">
            <p className="text-lg text-gray-300 leading-relaxed mb-6">
              {estimateData.description}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="bg-gray-700/30 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-2">Thumbnails in Queue</h3>
                <p className={`text-2xl font-bold text-transparent bg-gradient-to-r ${estimateData.color} bg-clip-text`}>
                  {thumbnailsInProgress}
                </p>
              </div>
              
              <div className="bg-gray-700/30 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-2">Last Updated</h3>
                <p className="text-gray-400">
                  {progressData ? getLastUpdated(progressData.updated_at) : 'Unknown'}
                </p>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-4">
              This estimate is based on current workload and may vary depending on project complexity.
            </p>
            <p className="text-gray-500 text-xs">
              Times are automatically updated as our queue changes.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default TimeEstimatePage;