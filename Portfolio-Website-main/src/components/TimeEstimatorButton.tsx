import React from 'react';
import { Clock } from 'lucide-react';

const TimeEstimatorButton: React.FC = () => {
  const handleClick = () => {
    window.open('/time-estimate', '_blank');
  };

  return (
    <button
      onClick={handleClick}
      className="fixed right-4 top-1/2 transform -translate-y-1/2 z-40
                 bg-gradient-to-r from-teal-500 to-purple-600 text-white
                 px-2 py-3 rounded-l-2xl shadow-2xl hover:shadow-teal-500/25
                 transition-all duration-300 hover:scale-105 hover:pr-6
                 flex items-center space-x-2 group max-w-xs tracking-wide"
      style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
    >
      <div className="flex flex-col items-center space-y-2">
        <Clock className="w-5 h-5 group-hover:animate-pulse" />
        <span className="text-sm font-semibold whitespace-nowrap transform rotate-180">
          Estimate Delivery
        </span>
      </div>
    </button>
  );
};

export default TimeEstimatorButton;