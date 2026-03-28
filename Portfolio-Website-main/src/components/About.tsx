import React from 'react';

const About: React.FC = () => {
  return (
    <section id="about" className="py-16 md:py-20 px-4 md:px-6 relative">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 opacity-50"></div>
      
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 lg:p-12 border border-gray-700 shadow-2xl relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-gradient-to-br from-teal-400 to-purple-600 p-1 animate-pulse flex-shrink-0">
              <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center">
                <span className="text-2xl md:text-4xl font-bold text-transparent bg-gradient-to-r from-teal-400 to-purple-500 bg-clip-text">
                  AM
                </span>
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6 text-transparent bg-gradient-to-r from-teal-400 to-purple-500 bg-clip-text">
                About Me
              </h2>
              
              <p className="text-base md:text-lg text-gray-300 leading-relaxed">
                I'm Abdul Mustafa, a professional YouTube thumbnail designer. With over 5 years of experience, 
                I specialize in designing high-performing thumbnails, full channel revamps, and A/B testing 
                strategies that help creators grow.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;