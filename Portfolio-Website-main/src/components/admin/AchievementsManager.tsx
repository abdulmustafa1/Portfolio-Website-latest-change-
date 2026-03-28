import React, { useState, useEffect } from 'react';
import { Plus, CreditCard as Edit, Trash2, Trophy, MessageSquare } from 'lucide-react';
import { supabase, Achievement, Review } from '../../lib/supabase';

const AchievementsManager: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [saving, setSaving] = useState(false);

  const [achievementForm, setAchievementForm] = useState({
    number: 0,
    suffix: '',
    label: '',
    icon: '',
  });

  const [reviewForm, setReviewForm] = useState({
    reviewer_name: '',
    reviewer_text: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [achievementsResult, reviewsResult] = await Promise.all([
        supabase.from('achievements').select('*').order('order_index'),
        supabase.from('reviews').select('*').order('order_index'),
      ]);

      if (achievementsResult.error) throw achievementsResult.error;
      if (reviewsResult.error) throw reviewsResult.error;

      setAchievements(achievementsResult.data || []);
      setReviews(reviewsResult.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAchievementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!achievementForm.label.trim() || !achievementForm.icon.trim()) return;

    setSaving(true);
    try {
      if (editingAchievement) {
        const { error } = await supabase
          .from('achievements')
          .update({
            number: achievementForm.number,
            suffix: achievementForm.suffix.trim(),
            label: achievementForm.label.trim(),
            icon: achievementForm.icon.trim(),
          })
          .eq('id', editingAchievement.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('achievements')
          .insert({
            number: achievementForm.number,
            suffix: achievementForm.suffix.trim(),
            label: achievementForm.label.trim(),
            icon: achievementForm.icon.trim(),
            order_index: achievements.length,
          });

        if (error) throw error;
      }

      await fetchData();
      resetAchievementForm();
    } catch (error) {
      console.error('Error saving achievement:', error);
      alert('Error saving achievement. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.reviewer_name.trim() || !reviewForm.reviewer_text.trim()) return;

    setSaving(true);
    try {
      if (editingReview) {
        const { error } = await supabase
          .from('reviews')
          .update({
            reviewer_name: reviewForm.reviewer_name.trim(),
            reviewer_text: reviewForm.reviewer_text.trim(),
          })
          .eq('id', editingReview.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('reviews')
          .insert({
            reviewer_name: reviewForm.reviewer_name.trim(),
            reviewer_text: reviewForm.reviewer_text.trim(),
            order_index: reviews.length,
          });

        if (error) throw error;
      }

      await fetchData();
      resetReviewForm();
    } catch (error) {
      console.error('Error saving review:', error);
      alert('Error saving review. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAchievement = async (id: string) => {
    if (!confirm('Are you sure you want to delete this achievement?')) return;

    try {
      const { error } = await supabase
        .from('achievements')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchData();
    } catch (error) {
      console.error('Error deleting achievement:', error);
      alert('Error deleting achievement. Please try again.');
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchData();
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Error deleting review. Please try again.');
    }
  };

  const resetAchievementForm = () => {
    setAchievementForm({ number: 0, suffix: '', label: '', icon: '' });
    setEditingAchievement(null);
    setShowAchievementModal(false);
  };

  const resetReviewForm = () => {
    setReviewForm({ reviewer_name: '', reviewer_text: '' });
    setEditingReview(null);
    setShowReviewModal(false);
  };

  const openEditAchievementModal = (achievement: Achievement) => {
    setEditingAchievement(achievement);
    setAchievementForm({
      number: achievement.number,
      suffix: achievement.suffix,
      label: achievement.label,
      icon: achievement.icon,
    });
    setShowAchievementModal(true);
  };

  const openEditReviewModal = (review: Review) => {
    setEditingReview(review);
    setReviewForm({
      reviewer_name: review.reviewer_name,
      reviewer_text: review.reviewer_text,
    });
    setShowReviewModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Achievements Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Achievement Cards</h2>
            <p className="text-gray-400">Manage count-up achievement statistics</p>
          </div>
          <button
            onClick={() => setShowAchievementModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-600
                     text-white font-semibold rounded-lg hover:scale-105 transition-all duration-300"
          >
            <Plus className="w-5 h-5" />
            <span>Add Achievement</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700
                       transform transition-all duration-300 hover:scale-105"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">{achievement.icon}</div>
                <div className="text-xl font-bold text-transparent bg-gradient-to-r from-teal-400 to-purple-500 bg-clip-text mb-1">
                  {achievement.number.toLocaleString()}{achievement.suffix}
                </div>
                <p className="text-gray-400 text-sm mb-4">{achievement.label}</p>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => openEditAchievementModal(achievement)}
                    className="flex-1 flex items-center justify-center space-x-1 px-3 py-2
                             bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30
                             transition-colors duration-300"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteAchievement(achievement.id)}
                    className="flex-1 flex items-center justify-center space-x-1 px-3 py-2
                             bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30
                             transition-colors duration-300"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {achievements.length === 0 && (
          <div className="text-center py-8">
            <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">No achievements yet</h3>
            <p className="text-gray-500 mb-4">Add your first achievement statistic</p>
            <button
              onClick={() => setShowAchievementModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-600 text-white
                       font-semibold rounded-lg hover:scale-105 transition-all duration-300"
            >
              Add First Achievement
            </button>
          </div>
        )}
      </div>

      {/* Reviews Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Client Reviews</h2>
            <p className="text-gray-400">Manage client testimonials and reviews</p>
          </div>
          <button
            onClick={() => setShowReviewModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-teal-600
                     text-white font-semibold rounded-lg hover:scale-105 transition-all duration-300"
          >
            <Plus className="w-5 h-5" />
            <span>Add Review</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700
                       transform transition-all duration-300 hover:scale-105"
            >
              <div className="flex items-center mb-3">
                <MessageSquare className="w-5 h-5 text-green-400 mr-2" />
                <h3 className="font-semibold text-white">{review.reviewer_name}</h3>
              </div>
              
              <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                "{review.reviewer_text}"
              </p>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => openEditReviewModal(review)}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2
                           bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30
                           transition-colors duration-300"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDeleteReview(review.id)}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2
                           bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30
                           transition-colors duration-300"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {reviews.length === 0 && (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">No reviews yet</h3>
            <p className="text-gray-500 mb-4">Add your first client review</p>
            <button
              onClick={() => setShowReviewModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-teal-600 text-white
                       font-semibold rounded-lg hover:scale-105 transition-all duration-300"
            >
              Add First Review
            </button>
          </div>
        )}
      </div>

      {/* Achievement Modal */}
      {showAchievementModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingAchievement ? 'Edit Achievement' : 'Add Achievement'}
            </h2>
            
            <form onSubmit={handleAchievementSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Number *
                </label>
                <input
                  type="number"
                  value={achievementForm.number}
                  onChange={(e) => setAchievementForm({ ...achievementForm, number: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white
                           focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="1000000"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Suffix
                </label>
                <input
                  type="text"
                  value={achievementForm.suffix}
                  onChange={(e) => setAchievementForm({ ...achievementForm, suffix: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white
                           focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="+ or K+ or M+"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Label *
                </label>
                <input
                  type="text"
                  value={achievementForm.label}
                  onChange={(e) => setAchievementForm({ ...achievementForm, label: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white
                           focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Views Generated"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Icon (Emoji) *
                </label>
                <input
                  type="text"
                  value={achievementForm.icon}
                  onChange={(e) => setAchievementForm({ ...achievementForm, icon: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white
                           focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="👁️"
                  required
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetAchievementForm}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500
                           transition-colors duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-600 text-white
                           rounded-lg hover:scale-105 transition-all duration-300 disabled:opacity-50
                           disabled:cursor-not-allowed disabled:transform-none"
                >
                  {saving ? 'Saving...' : editingAchievement ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingReview ? 'Edit Review' : 'Add Review'}
            </h2>
            
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Reviewer Name *
                </label>
                <input
                  type="text"
                  value={reviewForm.reviewer_name}
                  onChange={(e) => setReviewForm({ ...reviewForm, reviewer_name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white
                           focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Client Name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Review Text *
                </label>
                <textarea
                  value={reviewForm.reviewer_text}
                  onChange={(e) => setReviewForm({ ...reviewForm, reviewer_text: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white
                           focus:outline-none focus:ring-2 focus:ring-green-500 resize-vertical"
                  placeholder="Enter the review text..."
                  required
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetReviewForm}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500
                           transition-colors duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-teal-600 text-white
                           rounded-lg hover:scale-105 transition-all duration-300 disabled:opacity-50
                           disabled:cursor-not-allowed disabled:transform-none"
                >
                  {saving ? 'Saving...' : editingReview ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AchievementsManager;
