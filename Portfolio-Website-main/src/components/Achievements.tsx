import React from 'react';
import { useCountUp } from '../hooks/useCountUp';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { supabase, Achievement, Review } from '../lib/supabase'; 

const Achievements: React.FC = () => {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.3 });
  const [achievements, setAchievements] = React.useState<Achievement[]>([]);
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
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
      console.error('Error fetching achievements data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Static highlights data
  const highlights = [
    {
      icon: '🚀',
      text: 'Helped Many New Channels Grow'
    },
    {
      icon: '📊',
      text: 'Consistently Boosted Click-Through Rates'
    },
    {
      icon: '🎯',
      text: 'Over 1M+ Views Generated Across Channels'
    },
    {
      icon: '🏆',
      text: 'Crafted Thumbnails Across 10+ Niches'
    },
    {
      icon: '🔥',
      text: 'Supported Channels With Thousands of New Subscribers'
    }
  ];

  if (loading) {
    return (
      <section id="achievements" className="py-16 md:py-20 px-4 md:px-6" ref={ref}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="achievements" className="py-16 md:py-20 px-4 md:px-6" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-12 md:mb-16">
          <span className="text-transparent bg-gradient-to-r from-teal-400 to-purple-500 bg-clip-text">
            Achievements
          </span>
        </h2>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 mb-16 md:mb-20">
          {achievements.map((achievement, index) => (
            <AchievementCard
              key={index}
              achievement={achievement}
              isVisible={isVisible}
              delay={index * 200}
            />
          ))}
        </div>

        {/* Highlights */}
        <div className="mb-16 md:mb-20">
          <h3 className="text-xl md:text-2xl font-bold text-center mb-8 md:mb-12 text-gray-200">
            📈 Thumbnail Wins That Speak for Themselves
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {highlights.map((highlight, index) => (
              <div
                key={index}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-gray-700 
                         transform transition-all duration-500 hover:scale-105 hover:border-teal-500/50"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl md:text-2xl flex-shrink-0">{highlight.icon}</span>
                  <p className="text-sm md:text-base text-gray-300">{highlight.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div>
          <h3 className="text-xl md:text-2xl font-bold text-center mb-8 md:mb-12 text-gray-200">
            💬 Reviews From Clients
          </h3>
          {reviews.length > 0 ? (
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 md:gap-8 space-y-6">
              {reviews.map((review, index) => (
                <div
                  key={index}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 shadow-lg
                           transform transition-all duration-500 hover:scale-105 hover:border-purple-500/50
                           break-inside-avoid mb-6"
                >
                  <p className="text-gray-300 italic mb-4 leading-relaxed">"{review.reviewer_text}"</p>
                  <p className="text-sm font-semibold text-teal-400">– {review.reviewer_name}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div
                className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="text-lg font-medium text-gray-400 mb-2">No reviews yet</h3>
              <p className="text-gray-500">Client reviews will appear here once added from the admin panel.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

interface AchievementCardProps {
  achievement: {
    number: number;
    suffix: string;
    label: string;
    icon: string;
  };
  isVisible: boolean;
  delay: number;
}

const AchievementCard: React.FC<AchievementCardProps> = ({ achievement, isVisible, delay }) => {
  const isMillionViews = achievement.label === 'Views Generated';
  const { count, showFormatted } = useCountUp(
    achievement.number, 
    isVisible, 
    { duration: 2000, delay, isMillionViews }
  );
  
  const displayValue = isMillionViews && showFormatted 
    ? '1M' 
    : count.toLocaleString();

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 md:p-6 text-center border border-gray-700 
                   transform transition-all duration-500 hover:scale-105 hover:border-teal-500/50">
      <div className="text-2xl md:text-3xl mb-2 md:mb-3">{achievement.icon}</div>
      <div className="text-xl md:text-2xl lg:text-3xl font-bold text-transparent bg-gradient-to-r from-teal-400 to-purple-500 bg-clip-text mb-1 md:mb-2">
        {displayValue}{isMillionViews && showFormatted ? '+' : achievement.suffix}
      </div>
      <p className="text-gray-400 text-xs md:text-sm">{achievement.label}</p>
    </div>
  );
};

export default Achievements;