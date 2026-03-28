import React from 'react';
import { supabase, ABTest } from '../lib/supabase'; 

const ABTesting: React.FC = () => {
  const [abTests, setAbTests] = React.useState<ABTest[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchABTests();
  }, []);

  const fetchABTests = async () => {
    try {
      const { data, error } = await supabase
        .from('ab_tests')
        .select('*')
        .order('order_index');

      if (error) throw error;
      setAbTests(data || []);
    } catch (error) {
      console.error('Error fetching A/B tests:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section id="ab-testing" className="py-16 md:py-20 px-4 md:px-6 bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="ab-testing" className="py-16 md:py-20 px-4 md:px-6 bg-gray-900/50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-12 md:mb-16">
          <span className="text-transparent bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text">
            A/B Testing
          </span>
        </h2>
        
        <div className="space-y-12 md:space-y-16">
          {abTests.map((test, index) => (
            <div key={index} className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-purple-400 uppercase tracking-wider">Version A</h3>
                  <div className="rounded-xl overflow-hidden bg-gray-700 shadow-xl aspect-video">
                    <img
                      src={test.version_a_url}
                      alt="Version A"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-pink-400 uppercase tracking-wider">Version B</h3>
                  <div className="rounded-xl overflow-hidden bg-gray-700 shadow-xl aspect-video">
                    <img
                      src={test.version_b_url}
                      alt="Version B"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <h4 className="text-lg md:text-xl font-semibold text-gray-200 mb-2">Video Title</h4>
                <p className="text-base md:text-lg text-gray-400 px-4">"{test.video_title}"</p>
              </div>
            </div>
          ))}
        </div>

        {abTests.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🧪</span>
            </div>
            <h3 className="text-lg font-medium text-gray-400 mb-2">No A/B tests yet</h3>
            <p className="text-gray-500">A/B tests will appear here once added from the admin panel.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ABTesting;