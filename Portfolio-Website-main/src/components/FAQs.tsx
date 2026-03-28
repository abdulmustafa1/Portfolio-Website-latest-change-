import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react'; 
import { supabase, FAQ } from '../lib/supabase';

const FAQs: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .order('order_index');

      if (error) throw error;
      setFaqs(data || []);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (loading) {
    return (
      <section id="faqs" className="py-16 md:py-20 px-4 md:px-6 bg-gray-900/50">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="faqs" className="py-16 md:py-20 px-4 md:px-6 bg-gray-900/50">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-12 md:mb-16">
          <span className="text-transparent bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text">
            Frequently Asked Questions
          </span>
        </h2>
        
        <div className="space-y-3 md:space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={faq.id}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden
                       transform transition-all duration-300 hover:border-purple-500/50"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-4 md:px-6 py-4 md:py-6 text-left flex items-center justify-between 
                         hover:bg-gray-700/30 transition-colors duration-300"
              >
                <span className="text-base md:text-lg font-semibold text-gray-200 pr-4">{faq.question}</span>
                <ChevronDown
                  className={`w-4 h-4 md:w-5 md:h-5 text-purple-400 transform transition-transform duration-300 flex-shrink-0 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-4 md:px-6 pb-4 md:pb-6">
                  <p className="text-sm md:text-base text-gray-400 leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {faqs.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">❓</span>
            </div>
            <h3 className="text-lg font-medium text-gray-400 mb-2">No FAQs yet</h3>
            <p className="text-gray-500">Frequently asked questions will appear here once added from the admin panel.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default FAQs;