import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Mail, MessageCircle, Phone } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PrivateAccessProps {
  onBack: () => void;
}

const PrivateAccess: React.FC<PrivateAccessProps> = ({ onBack }) => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'private123') {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect password. Please try again.');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form inputs
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      alert('Please fill in all fields');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert('Please enter a valid email address');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('private_form_submissions')
        .insert({
          name: formData.name.trim(),
          email: formData.email.trim(),
          message: formData.message.trim(),
        });

      if (error) throw error;

      setSubmitSuccess(true);
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error submitting form. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 relative z-10">
        <button
          onClick={onBack}
          className="absolute top-6 left-6 p-3 text-gray-400 hover:text-white transition-colors duration-300
                     bg-gray-800/50 backdrop-blur-sm rounded-full border border-gray-700 hover:border-teal-500"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-gray-700 shadow-2xl max-w-md w-full">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">
            <span className="text-transparent bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text">
              Private Access
            </span>
          </h1>
          
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white
                         placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                         transition-all duration-300"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white
                         transition-colors duration-300"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            
            <button
              type="submit"
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg
                       transform transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25
                       focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              Access Private Area
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16 px-4 md:px-6 relative z-10">
      <button
        onClick={onBack}
        className="fixed top-6 left-6 p-3 text-gray-400 hover:text-white transition-colors duration-300
                   bg-gray-800/50 backdrop-blur-sm rounded-full border border-gray-700 hover:border-teal-500 z-50"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-12 md:mb-16">
          <span className="text-transparent bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text">
            Private Contact Details
          </span>
        </h1>

        {/* Contact Details */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-gray-700 shadow-2xl mb-12">
          <h2 className="text-xl md:text-2xl font-bold text-center mb-8 text-gray-200">
            Direct Contact Information
          </h2>
          
          <div className="space-y-6">
            <div className="flex items-center space-x-4 p-4 bg-gray-700/30 rounded-lg">
              <Mail className="w-6 h-6 text-teal-400 flex-shrink-0" />
              <div>
                <p className="text-gray-400 text-sm">Email</p>
                <a 
                  href="mailto:abdulmustafabusiness1@gmail.com"
                  className="text-white hover:text-teal-400 transition-colors duration-300 break-all"
                >
                  abdulmustafabusiness1@gmail.com
                </a>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-4 bg-gray-700/30 rounded-lg">
              <MessageCircle className="w-6 h-6 text-purple-400 flex-shrink-0" />
              <div>
                <p className="text-gray-400 text-sm">Discord</p>
                <p className="text-white">@staticblade72</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-4 bg-gray-700/30 rounded-lg">
              <Phone className="w-6 h-6 text-pink-400 flex-shrink-0" />
              <div>
                <p className="text-gray-400 text-sm">WhatsApp</p>
                <a 
                  href="https://wa.me/923170545403"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-pink-400 transition-colors duration-300"
                >
                  +923170545403
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-gray-700 shadow-2xl">
          <h2 className="text-xl md:text-2xl font-bold text-center mb-8 text-gray-200">
            Send Me a Message
          </h2>
          
          {submitSuccess && (
            <div className="mb-6 bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <p className="text-green-400 text-center">
                ✅ Message sent successfully! I'll get back to you soon.
              </p>
            </div>
          )}
          
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-gray-400 text-sm mb-2">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white
                         placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent
                         transition-all duration-300"
                placeholder="Your name"
                required
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-gray-400 text-sm mb-2">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white
                         placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent
                         transition-all duration-300"
                placeholder="your.email@example.com"
                required
              />
            </div>
            
            <div>
              <label htmlFor="message" className="block text-gray-400 text-sm mb-2">Message</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows={5}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white
                         placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent
                         transition-all duration-300 resize-vertical"
                placeholder="Tell me about your project..."
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={submitting}
              className="w-full px-6 py-3 bg-gradient-to-r from-teal-500 to-purple-600 text-white font-semibold rounded-lg
                       transform transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-teal-500/25
                       focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-gray-900
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {submitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PrivateAccess;