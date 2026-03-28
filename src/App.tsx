import React, { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About'; 
import Portfolio from './components/Portfolio'; 
import ABTesting from './components/ABTesting'; 
import Achievements from './components/Achievements'; 
import FAQs from './components/FAQs'; 
import Contact from './components/Contact'; 
import Footer from './components/Footer'; 
import PrivateAccess from './components/PrivateAccess'; 
import AdminPanel from './components/admin/AdminPanel'; 
import ParticleBackground from './components/ParticleBackground'; 
import AllItems from './components/AllItems';
import TimeEstimatorButton from './components/TimeEstimatorButton';
import TimeEstimatePage from './components/TimeEstimatePage';
import { trackSiteVisit } from './lib/supabase';
import './index.css';

function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [showPrivateAccess, setShowPrivateAccess] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showAllItems, setShowAllItems] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    // Track site visit
    trackSiteVisit();
    
    const observerOptions = {
      threshold: 0.3,
      rootMargin: '-100px 0px',
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    const sections = document.querySelectorAll('section[id]');
    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);

  // Check if current URL is admin panel
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/admin') {
      setShowAdminPanel(true);
    } else if (path === '/all-items') {
      setShowAllItems(true);
    } else if (path === '/time-estimate') {
      // Handle time estimate page
      return;
    }
  }, []);

  // Handle admin panel navigation
  const handleAdminAccess = () => {
    window.history.pushState({}, '', '/admin');
    setShowAdminPanel(true);
  };

  const handleBackFromAdmin = () => {
    window.history.pushState({}, '', '/');
    setShowAdminPanel(false);
  };

  const handleShowAllItems = (category: string = 'all') => {
    setSelectedCategory(category);
    window.history.pushState({}, '', '/all-items');
    setShowAllItems(true);
  };

  const handleBackFromAllItems = () => {
    window.history.pushState({}, '', '/');
    setShowAllItems(false);
  };

  // Handle time estimate page
  if (window.location.pathname === '/time-estimate') {
    return <TimeEstimatePage />;
  }

  if (showAdminPanel) {
    return <AdminPanel />;
  }

  if (showAllItems) {
    return (
      <div className="bg-gray-900 text-white min-h-screen relative overflow-x-hidden">
        <ParticleBackground />
        <AllItems 
          selectedCategory={selectedCategory}
          onBack={handleBackFromAllItems}
          onCategoryChange={setSelectedCategory}
        />
      </div>
    );
  }

  if (showPrivateAccess) {
    return (
      <div className="bg-gray-900 text-white min-h-screen relative overflow-x-hidden">
        <ParticleBackground />
        <PrivateAccess onBack={() => setShowPrivateAccess(false)} />
      </div>
    );
  }

  return (
    <div className="bg-gray-900 text-white min-h-screen relative overflow-x-hidden">
      <ParticleBackground heroOnly />
      <Navbar activeSection={activeSection} />
      <TimeEstimatorButton />
      
      <main className="relative z-10">
        <Hero />
        <About />
        <Portfolio 
          onShowAllItems={handleShowAllItems}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
        <ABTesting />
        <Achievements />
        <FAQs />
        <Contact />
      </main>
      
      <Footer 
        onPrivateAccess={() => setShowPrivateAccess(true)}
        onAdminAccess={handleAdminAccess}
      />
    </div>
  );
}

export default App;