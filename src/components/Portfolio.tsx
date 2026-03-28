import React, { useState } from 'react';
import { Search, Play, Tag as TagIcon, Star, AlertCircle } from 'lucide-react';
import Lightbox from './Lightbox';
import VideoPlayer from './VideoPlayer';
import { supabase, PortfolioItem, Category, toggleItemStar, getStarredCount } from '../lib/supabase';
import { fuzzySearch } from '../utils/fuzzySearch';

interface PortfolioProps {
  onShowAllItems: (category?: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const Portfolio: React.FC<PortfolioProps> = ({ onShowAllItems, selectedCategory, onCategoryChange }) => {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [videoPlayerOpen, setVideoPlayerOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentVideoUrl, setCurrentVideoUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [starredCounts, setStarredCounts] = useState<Record<string, number>>({});
  const [searchMessage, setSearchMessage] = useState<string>('');

  React.useEffect(() => {
    fetchPortfolioData();
  }, []);
  
  const fetchPortfolioData = async () => {
    try {
      // Fetch categories (only visible ones)
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('is_hidden', false) 
        .order('order_index');

      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);

      // Fetch portfolio items with their categories, tags, and click counts
      const { data: itemsData, error: itemsError } = await supabase
        .from('portfolio_items')
        .select(`
          *,
          category:categories!inner(*), 
          portfolio_item_tags( 
            tag:tags(*)
          )
        `) 
        .eq('category.is_hidden', false) 
        .order('is_starred', { ascending: false })
        .order('created_at', { ascending: false });

      if (itemsError) throw itemsError;

      // Transform the data to include tags array
      const itemsWithTags = (itemsData || []).map(item => ({
        ...item,
        tags: item.portfolio_item_tags?.map((pit: any) => pit.tag) || [],
      }));

      setItems(itemsWithTags);

      // Fetch starred counts for each category
      const counts: Record<string, number> = {};
      for (const category of categoriesData || []) {
        counts[category.id] = await getStarredCount(category.id);
      }
      setStarredCounts(counts);
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = React.useMemo(() => {
    let filtered = [...items];
    setSearchMessage('');

    // Filter by category first
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category?.slug === selectedCategory);
    }

    // Get popular items (starred first, then recent)
    const popularItems = filtered.slice(0, 12);

    // Apply fuzzy search filter to popular items
    let displayItems = popularItems;

    // Filter by category
    if (selectedCategory !== 'all') {
      displayItems = displayItems.filter(item => item.category?.slug === selectedCategory);
    }

    // Apply fuzzy search
    if (searchQuery.trim()) {
      displayItems = fuzzySearch(
        displayItems,
        searchQuery,
        (item) => [
          item.category?.name || '',
          ...(item.tags?.map(tag => tag.name) || [])
        ],
        0.4 // Lower threshold for more flexible matching
      );

      // Check if search might be for a tag that exists but has no items
      if (displayItems.length === 0) {
        const allTags = items.flatMap(item => item.tags || []);
        const matchingTags = fuzzySearch(
          allTags,
          searchQuery,
          (tag) => [tag.name],
          0.6
        );
        
        if (matchingTags.length > 0) {
          setSearchMessage(`No items available for tag "${matchingTags[0].name}"`);
        }
      }
    }
    
    return displayItems;
  }, [items, selectedCategory, searchQuery, setSearchMessage]);

  const handleToggleStar = async (item: PortfolioItem) => {
    const newStarredState = !item.is_starred;
    
    try {
      await toggleItemStar(item.id, newStarredState);
      
      // Update local state
      setItems(prevItems =>
        prevItems.map(prevItem =>
          prevItem.id === item.id
            ? { ...prevItem, is_starred: newStarredState }
            : prevItem
        )
      );

      // Update starred count
      const categoryId = item.category_id;
      setStarredCounts(prev => ({
        ...prev,
        [categoryId]: newStarredState 
          ? (prev[categoryId] || 0) + 1 
          : Math.max(0, (prev[categoryId] || 0) - 1)
      }));
    } catch (error) {
      console.error('Error toggling star:', error);
      alert('Failed to update star status. Please try again.');
    }
  };

  const canStar = (item: PortfolioItem) => {
    if (item.is_starred) return true; // Can always unstar
    return (starredCounts[item.category_id] || 0) < 12; // Can star if under limit
  };

  const getAspectRatioClass = (aspectRatio: string) => {
    switch (aspectRatio) {
      case '1:1':
        return 'aspect-square';
      case '9:16':
        return 'aspect-[9/16]';
      default:
        return 'aspect-video';
    }
  };

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const openVideoPlayer = (videoUrl: string) => {
    setCurrentVideoUrl(videoUrl);
    setVideoPlayerOpen(true);
  };

  const handleItemClick = (item: any, index: number) => {
    if (item.file_type === 'video') {
      openVideoPlayer(item.file_url);
    } else {
      openLightbox(index);
    }
  };

  if (loading) {
    return (
      <section id="portfolio" className="py-16 md:py-20 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="portfolio" className="py-16 md:py-20 px-4 md:px-6 relative bg-gray-850"> 
      {/* Subtle geometric background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-32 h-32 border border-teal-400 rounded-full"></div>
        <div className="absolute top-40 right-20 w-24 h-24 border border-purple-400 rounded-lg rotate-45"></div>
        <div className="absolute bottom-20 left-1/4 w-16 h-16 border border-pink-400 rounded-full"></div>
        <div className="absolute bottom-40 right-1/3 w-20 h-20 border border-teal-400 rounded-lg rotate-12"></div>
      </div>
      
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-8 md:mb-12">
          <span className="text-transparent bg-gradient-to-r from-teal-400 to-purple-500 bg-clip-text">
            My Portfolio
          </span>
        </h2>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-8 md:mb-12">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by niche or style..."
              className="w-full px-4 py-3 pl-12 bg-gray-800/50 border border-gray-600 rounded-lg text-white
                       placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent
                       transition-all duration-300"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 px-3 py-1 z-30
                         bg-gray-600 hover:bg-gray-500 text-white text-sm rounded transition-colors duration-300"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex justify-center mb-8 md:mb-12 overflow-x-auto">
          <div className="flex space-x-3 px-4 py-2 min-w-max relative z-20">
            <button
              onClick={() => {
                onCategoryChange('all');
                setSearchQuery('');
              }}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-gradient-to-r from-teal-500 to-purple-600 text-white shadow-lg shadow-teal-500/25 transform scale-105'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50 hover:scale-105 hover:shadow-lg hover:shadow-gray-500/25 bg-gray-800/30 border border-gray-600'
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category.slug}
                onClick={() => {
                  onCategoryChange(category.slug);
                  setSearchQuery('');
                }}
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 whitespace-nowrap ${
                  selectedCategory === category.slug
                    ? 'bg-gradient-to-r from-teal-500 to-purple-600 text-white shadow-lg shadow-teal-500/25 transform scale-105'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50 hover:scale-105 hover:shadow-lg hover:shadow-gray-500/25 bg-gray-800/30 border border-gray-600'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
        
        {/* Popular Items Heading */}
        <div className="text-center mb-8">
          <h3 className="text-xl md:text-2xl font-bold text-gray-200">
            POPULAR ITEMS
          </h3>
          <p className="text-gray-400 text-sm mt-2">
            Top starred items {selectedCategory !== 'all' ? `in ${categories.find(c => c.slug === selectedCategory)?.name}` : ''}
          </p>
        </div>

        {/* Portfolio Grid */}
        {filteredItems.length > 0 ? ( 
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
            {filteredItems.map((item, index) => (
              <div
                key={item.id}
                className="group transform transition-all duration-500 hover:scale-105 active:scale-95"
              >
                <div className="relative overflow-hidden rounded-xl bg-gray-800 shadow-2xl">
                  <div className={`relative ${getAspectRatioClass(item.category?.aspect_ratio || '16:9')}`}>
                    <img
                      src={item.file_url}
                      alt={item.title || 'Portfolio item'}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 cursor-pointer"
                      loading="lazy"
                      onClick={() => handleItemClick(item, index)}
                    />
                    
                    {item.file_type === 'video' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors duration-300">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center
                                       transform transition-all duration-300 group-hover:scale-110">
                          <Play className="w-8 h-8 text-white ml-1" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            {searchMessage ? (
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-white" />
              </div>
            ) : (
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-500" />
            </div>
            )}
            <h3 className="text-lg font-medium text-gray-400 mb-2">
              {searchMessage || (searchQuery ? 'No items found' : 'No portfolio items yet')}
            </h3>
            <p className="text-gray-500">
              {searchMessage 
                ? 'Try searching for a different tag or category.'
                : searchQuery 
                  ? `No items match "${searchQuery}". Try a different search term.`
                  : 'Portfolio items will appear here once added from the admin panel.'
              }
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg
                         transition-colors duration-300"
              >
                Clear Search
              </button>
            )}
          </div>
        )}

        {/* View More Button */}
        <div className="text-center mt-12">
          <button
            onClick={() => onShowAllItems(selectedCategory)}
            className="px-8 py-4 bg-gradient-to-r from-teal-500 to-purple-600 text-white font-semibold rounded-lg
                     transform transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-teal-500/25"
          >
            View More
          </button>
        </div>
      </div>

      {lightboxOpen && (
        <Lightbox
          images={filteredItems
            .filter(item => item.file_type !== 'video')
            .map(item => ({
              src: item.file_url,
              alt: item.title || 'Portfolio item',
              title: item.title
            }))
          }
          currentIndex={currentImageIndex}
          onClose={() => setLightboxOpen(false)}
          onNavigate={setCurrentImageIndex}
        />
      )}

      {videoPlayerOpen && (
        <VideoPlayer
          videoUrl={currentVideoUrl}
          onClose={() => setVideoPlayerOpen(false)}
        />
      )}
    </section>
  );
};

export default Portfolio;