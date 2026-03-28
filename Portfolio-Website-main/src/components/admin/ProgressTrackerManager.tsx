import React, { useState, useEffect } from 'react';
import { Clock, Save, TrendingUp, RefreshCw } from 'lucide-react';
import { supabase, ProgressTracker } from '../../lib/supabase';

const ProgressTrackerManager: React.FC = () => {
  const [progressData, setProgressData] = useState<ProgressTracker | null>(null);
  const [thumbnailsInProgress, setThumbnailsInProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProgressData();
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
      
      if (data) {
        setProgressData(data);
        setThumbnailsInProgress(data.thumbnails_in_progress);
      }
    } catch (error) {
      console.error('Error fetching progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (progressData) {
        // Update existing record
        const { error } = await supabase
          .from('progress_tracker')
          .update({
            thumbnails_in_progress: thumbnailsInProgress,
            updated_at: new Date().toISOString(),
          })
          .eq('id', progressData.id);

        if (error) throw error;
      } else {
        // Create new record
        const { error } = await supabase
          .from('progress_tracker')
          .insert({
            thumbnails_in_progress: thumbnailsInProgress,
          });

        if (error) throw error;
      }

      await fetchProgressData();
      alert('Progress updated successfully!');
    } catch (error) {
      console.error('Error saving progress:', error);
      alert('Error saving progress. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getEstimateInfo = (count: number) => {
    if (count <= 5) {
      return { time: '24 hours', color: 'text-green-400', bgColor: 'bg-green-500/20' };
    } else if (count <= 10) {
      return { time: '30 hours', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' };
    } else if (count <= 15) {
      return { time: '48 hours', color: 'text-orange-400', bgColor: 'bg-orange-500/20' };
    } else {
      return { time: '72 hours', color: 'text-red-400', bgColor: 'bg-red-500/20' };
    }
  };

  const estimateInfo = getEstimateInfo(thumbnailsInProgress);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Thumbnail Progress Tracker</h1>
          <p className="text-gray-400">Manage the number of thumbnails currently in progress</p>
        </div>
        <button
          onClick={fetchProgressData}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-700 text-white rounded-lg
                   hover:bg-gray-600 transition-colors duration-300"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-teal-400" />
            Update Progress Count
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Thumbnails Currently in Progress
              </label>
              <input
                type="number"
                min="0"
                value={thumbnailsInProgress}
                onChange={(e) => setThumbnailsInProgress(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-lg
                         focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Enter number of thumbnails..."
              />
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3
                       bg-gradient-to-r from-teal-500 to-purple-600 text-white font-semibold rounded-lg
                       hover:scale-105 transition-all duration-300 disabled:opacity-50
                       disabled:cursor-not-allowed disabled:transform-none"
            >
              <Save className="w-5 h-5" />
              <span>{saving ? 'Saving...' : 'Update Progress'}</span>
            </button>
          </div>
        </div>

        {/* Preview Section */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-purple-400" />
            Current Estimate Preview
          </h2>
          
          <div className={`${estimateInfo.bgColor} rounded-lg p-6 text-center`}>
            <div className={`text-3xl font-bold ${estimateInfo.color} mb-2`}>
              {estimateInfo.time}
            </div>
            <p className="text-gray-300 mb-4">Estimated Delivery Time</p>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-700/50 rounded-lg p-3">
                <p className="text-gray-400">In Progress</p>
                <p className="text-xl font-bold text-white">{thumbnailsInProgress}</p>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-3">
                <p className="text-gray-400">Last Updated</p>
                <p className="text-white">
                  {progressData 
                    ? new Date(progressData.updated_at).toLocaleString()
                    : 'Never'
                  }
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-xs text-gray-500">
            <p>This preview shows what clients will see on the time estimate page.</p>
          </div>
        </div>
      </div>

      {/* Delivery Time Reference */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <h2 className="text-lg font-semibold text-white mb-4">Delivery Time Reference</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-center">
            <div className="text-green-400 font-bold text-lg mb-1">0-5</div>
            <div className="text-green-300 text-sm mb-2">24 hours</div>
            <div className="text-xs text-gray-400">Fast Track</div>
          </div>
          
          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 text-center">
            <div className="text-yellow-400 font-bold text-lg mb-1">6-10</div>
            <div className="text-yellow-300 text-sm mb-2">30 hours</div>
            <div className="text-xs text-gray-400">Standard</div>
          </div>
          
          <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-4 text-center">
            <div className="text-orange-400 font-bold text-lg mb-1">11-15</div>
            <div className="text-orange-300 text-sm mb-2">48 hours</div>
            <div className="text-xs text-gray-400">Busy Period</div>
          </div>
          
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 text-center">
            <div className="text-red-400 font-bold text-lg mb-1">15+</div>
            <div className="text-red-300 text-sm mb-2">72 hours</div>
            <div className="text-xs text-gray-400">High Demand</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressTrackerManager;