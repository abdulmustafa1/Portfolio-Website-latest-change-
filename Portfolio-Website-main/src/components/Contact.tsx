import React from 'react';
import { ExternalLink } from 'lucide-react';

const Contact: React.FC = () => {
  return (
    <section id="contact" className="py-16 md:py-20 px-4 md:px-6 relative">
      {/* Blurred abstract background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-r from-teal-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-r from-teal-500/5 to-purple-500/5 rounded-full blur-2xl"></div>
      </div>
      
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-12 md:mb-16">
          <span className="text-transparent bg-gradient-to-r from-teal-400 to-purple-500 bg-clip-text">
            Let's Work Together
          </span>
        </h2>
        
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 lg:p-12 border border-gray-700 shadow-2xl relative z-10">
          <p className="text-lg md:text-xl text-gray-300 mb-6 md:mb-8 leading-relaxed">
            Ready to create thumbnails that drive results? Let's discuss your project and 
            take your YouTube channel to the next level.
          </p>
          
          <a
            href="https://www.upwork.com/freelancers/~018ef98d50ab22822b"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-3 px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-green-500 to-blue-600 
                     text-white font-semibold rounded-lg transform transition-all duration-300 
                     hover:scale-105 hover:shadow-2xl hover:shadow-green-500/25
                     focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            <span>Contact Me on Upwork</span>
            <ExternalLink className="w-4 h-4 md:w-5 md:h-5" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default Contact;