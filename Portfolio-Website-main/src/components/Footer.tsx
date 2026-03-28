import React from 'react';

interface FooterProps {
  onPrivateAccess: () => void;
  onAdminAccess: () => void;
}

const Footer: React.FC<FooterProps> = ({ onPrivateAccess, onAdminAccess }) => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-black/80 backdrop-blur-md border-t border-gray-800 py-8 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8 mb-6">
          <button
            onClick={() => scrollToSection('home')}
            className="text-gray-400 hover:text-teal-400 transition-colors duration-300 text-sm md:text-base"
          >
            Home
          </button>
          <button
            onClick={() => scrollToSection('portfolio')}
            className="text-gray-400 hover:text-teal-400 transition-colors duration-300 text-sm md:text-base"
          >
            Portfolio
          </button>
          <button
            onClick={() => scrollToSection('ab-testing')}
            className="text-gray-400 hover:text-teal-400 transition-colors duration-300 text-sm md:text-base"
          >
            A/B Testing
          </button>
          <button
            onClick={() => scrollToSection('achievements')}
            className="text-gray-400 hover:text-teal-400 transition-colors duration-300 text-sm md:text-base"
          >
            Achievements
          </button>
          <button
            onClick={() => scrollToSection('faqs')}
            className="text-gray-400 hover:text-teal-400 transition-colors duration-300 text-sm md:text-base"
          >
            FAQs
          </button>
          <button
            onClick={onPrivateAccess}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg
                     transform transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25
                     text-sm md:text-base"
          >
            Private Access
          </button>
        </div>
        
        <div className="text-center text-gray-500 text-xs md:text-sm">
          © All rights reserved
        </div>
      </div>
    </footer>
  );
};

export default Footer;