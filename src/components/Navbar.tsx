import React, { useState, useRef } from 'react';
import { ChevronDown, Menu, X } from 'lucide-react';

interface NavbarProps {
  activeSection: string;
}

const Navbar: React.FC<NavbarProps> = ({ activeSection }) => {
  const [portfolioDropdown, setPortfolioDropdown] = useState(false);
  const [aboutDropdown, setAboutDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobilePortfolioOpen, setMobilePortfolioOpen] = useState(false);
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);

  // refs for handling timeouts
  const portfolioTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const aboutTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    // Close mobile menu and dropdowns after navigation
    setMobileMenuOpen(false);
    setMobilePortfolioOpen(false);
    setMobileAboutOpen(false);
    setPortfolioDropdown(false);
    setAboutDropdown(false);
  };

  // --- Portfolio dropdown handlers with delay ---
  const handlePortfolioMouseEnter = () => {
    if (portfolioTimeout.current) clearTimeout(portfolioTimeout.current);
    setPortfolioDropdown(true);
  };

  const handlePortfolioMouseLeave = () => {
    portfolioTimeout.current = setTimeout(() => {
      setPortfolioDropdown(false);
    }, 200); // 200ms delay before closing
  };

  // --- About dropdown handlers with delay ---
  const handleAboutMouseEnter = () => {
    if (aboutTimeout.current) clearTimeout(aboutTimeout.current);
    setAboutDropdown(true);
  };

  const handleAboutMouseLeave = () => {
    aboutTimeout.current = setTimeout(() => {
      setAboutDropdown(false);
    }, 200); // 200ms delay before closing
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div 
            className="text-xl font-bold text-transparent bg-gradient-to-r from-teal-400 to-purple-500 bg-clip-text cursor-pointer"
            onClick={() => scrollToSection('home')}
          >
            Mustafavisuals
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection('home')}
              className={`transition-colors duration-300 ${
                activeSection === 'home' ? 'text-teal-400' : 'text-gray-300 hover:text-white'
              }`}
            >
              Home
            </button>

            {/* Portfolio dropdown */}
            <div 
              className="relative"
              onMouseEnter={handlePortfolioMouseEnter}
              onMouseLeave={handlePortfolioMouseLeave}
            >
              <button className={`flex items-center space-x-1 transition-colors duration-300 ${
                activeSection === 'portfolio' || activeSection === 'ab-testing' 
                  ? 'text-teal-400' 
                  : 'text-gray-300 hover:text-white'
              }`}>
                <span>Portfolio</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {portfolioDropdown && (
                <div 
                  className="absolute top-full left-0 mt-2 bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-700 min-w-48 overflow-hidden"
                >
                  <button
                    onClick={() => scrollToSection('portfolio')}
                    className="block w-full text-left px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors duration-200"
                  >
                    Portfolio Gallery
                  </button>
                  <button
                    onClick={() => scrollToSection('ab-testing')}
                    className="block w-full text-left px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors duration-200"
                  >
                    A/B Testing
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => scrollToSection('achievements')}
              className={`transition-colors duration-300 ${
                activeSection === 'achievements' ? 'text-teal-400' : 'text-gray-300 hover:text-white'
              }`}
            >
              Achievements
            </button>

            {/* About dropdown */}
            <div 
              className="relative"
              onMouseEnter={handleAboutMouseEnter}
              onMouseLeave={handleAboutMouseLeave}
            >
              <button className={`flex items-center space-x-1 transition-colors duration-300 ${
                activeSection === 'about' || activeSection === 'faqs' || activeSection === 'contact'
                  ? 'text-teal-400' 
                  : 'text-gray-300 hover:text-white'
              }`}>
                <span>About Me</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {aboutDropdown && (
                <div 
                  className="absolute top-full left-0 mt-2 bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-700 min-w-48 overflow-hidden"
                >
                  <button
                    onClick={() => scrollToSection('about')}
                    className="block w-full text-left px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors duration-200"
                  >
                    About Me
                  </button>
                  <button
                    onClick={() => scrollToSection('faqs')}
                    className="block w-full text-left px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors duration-200"
                  >
                    FAQs
                  </button>
                  <button
                    onClick={() => scrollToSection('contact')}
                    className="block w-full text-left px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors duration-200"
                  >
                    Contact Me
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-300 hover:text-white transition-colors duration-300"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-800">
            <div className="space-y-2 pt-4">
              <button
                onClick={() => scrollToSection('home')}
                className={`block w-full text-left py-3 px-4 rounded-lg transition-colors duration-300 ${
                  activeSection === 'home' ? 'text-teal-400 bg-gray-800/50' : 'text-gray-300 hover:text-white hover:bg-gray-800/30'
                }`}
              >
                Home
              </button>

              {/* Mobile Portfolio */}
              <div>
                <button
                  onClick={() => setMobilePortfolioOpen(!mobilePortfolioOpen)}
                  className={`flex items-center justify-between w-full text-left py-3 px-4 rounded-lg transition-colors duration-300 ${
                    activeSection === 'portfolio' || activeSection === 'ab-testing' 
                      ? 'text-teal-400 bg-gray-800/50' 
                      : 'text-gray-300 hover:text-white hover:bg-gray-800/30'
                  }`}
                >
                  <span>Portfolio</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${mobilePortfolioOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {mobilePortfolioOpen && (
                  <div className="ml-4 mt-2 space-y-1">
                    <button
                      onClick={() => scrollToSection('portfolio')}
                      className="block w-full text-left py-2 px-4 text-gray-400 hover:text-white hover:bg-gray-800/30 rounded-lg transition-colors duration-200"
                    >
                      Portfolio Gallery
                    </button>
                    <button
                      onClick={() => scrollToSection('ab-testing')}
                      className="block w-full text-left py-2 px-4 text-gray-400 hover:text-white hover:bg-gray-800/30 rounded-lg transition-colors duration-200"
                    >
                      A/B Testing
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => scrollToSection('achievements')}
                className={`block w-full text-left py-3 px-4 rounded-lg transition-colors duration-300 ${
                  activeSection === 'achievements' ? 'text-teal-400 bg-gray-800/50' : 'text-gray-300 hover:text-white hover:bg-gray-800/30'
                }`}
              >
                Achievements
              </button>

              {/* Mobile About */}
              <div>
                <button
                  onClick={() => setMobileAboutOpen(!mobileAboutOpen)}
                  className={`flex items-center justify-between w-full text-left py-3 px-4 rounded-lg transition-colors duration-300 ${
                    activeSection === 'about' || activeSection === 'faqs' || activeSection === 'contact'
                      ? 'text-teal-400 bg-gray-800/50' 
                      : 'text-gray-300 hover:text-white hover:bg-gray-800/30'
                  }`}
                >
                  <span>About Me</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${mobileAboutOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {mobileAboutOpen && (
                  <div className="ml-4 mt-2 space-y-1">
                    <button
                      onClick={() => scrollToSection('about')}
                      className="block w-full text-left py-2 px-4 text-gray-400 hover:text-white hover:bg-gray-800/30 rounded-lg transition-colors duration-200"
                    >
                      About Me
                    </button>
                    <button
                      onClick={() => scrollToSection('faqs')}
                      className="block w-full text-left py-2 px-4 text-gray-400 hover:text-white hover:bg-gray-800/30 rounded-lg transition-colors duration-200"
                    >
                      FAQs
                    </button>
                    <button
                      onClick={() => scrollToSection('contact')}
                      className="block w-full text-left py-2 px-4 text-gray-400 hover:text-white hover:bg-gray-800/30 rounded-lg transition-colors duration-200"
                    >
                      Contact Me
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
