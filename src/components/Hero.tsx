import React from 'react';
import { ChevronDown } from 'lucide-react';

const Hero: React.FC = () => {
  const scrollToPortfolio = () => {
    const element = document.getElementById('portfolio');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToContact = () => {
    const element = document.getElementById('contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="min-h-screen flex flex-col items-center justify-center relative px-4 md:px-6">
      <div className="text-center max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 animate-fade-in-up">
          <span className="text-transparent bg-gradient-to-r from-teal-400 via-purple-500 to-pink-500 bg-clip-text">
            Abdul Mustafa
          </span>
        </h1>
        
        <h2 className="text-xl sm:text-2xl md:text-3xl text-gray-300 mb-6 md:mb-8 animate-fade-in-up animation-delay-300">
          Professional YouTube Thumbnail Designer
        </h2>
        
        <p className="text-base sm:text-lg md:text-xl text-gray-400 mb-8 md:mb-12 leading-relaxed animate-fade-in-up animation-delay-600 px-4">
          A self-motivated graphic designer specialized in creating visually compelling designs 
          that help brands stand out in the digital space.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 md:gap-6 items-center justify-center mb-12 md:mb-16 animate-fade-in-up animation-delay-900">
          <button
            onClick={scrollToPortfolio}
            className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-teal-500 to-purple-600 text-white font-semibold rounded-lg 
                     transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-teal-500/25
                     focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            View My Work
          </button>
          
          <button
            onClick={scrollToContact}
            className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 border-2 border-teal-400 text-teal-400 font-semibold rounded-lg
                     transform transition-all duration-300 hover:bg-teal-400 hover:text-gray-900 hover:scale-105
                     focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            Get in Touch
          </button>
        </div>
        
        <div className="animate-bounce cursor-pointer" onClick={scrollToPortfolio}>
          <ChevronDown className="w-6 h-6 md:w-8 md:h-8 text-teal-400 mx-auto" />
        </div>
      </div>
    </section>
  );
};

export default Hero;