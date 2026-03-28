import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''; 

// Check if environment variables are properly configured
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase environment variables are missing. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file.'
  );
}

// Validate URL format
const isValidUrl = (url: string) => {
  try {
    new URL(url);
    // Basic check for Supabase domain, can be more robust if needed
    return url.includes('.supabase.co') || url.includes('localhost'); 
  } catch {
    return false;
  }
};

if (!isValidUrl(supabaseUrl)) {
  throw new Error(
    `VITE_SUPABASE_URL format is invalid: ${supabaseUrl}. Expected format: https://your-project-id.supabase.co`
  );
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);

// Database types
export interface Category {
  id: string;
  name: string;
  slug: string; // Added slug for categories
  aspect_ratio: '16:9' | '1:1' | '9:16';
  is_hidden: boolean;
  order_index: number;
  created_at: string;
}

export interface PortfolioItem {
  id: string;
  file_url: string;
  file_type: 'image' | 'video';
  category_id: string;
  order_index: number;
  created_at: string; // Added created_at
  is_starred: boolean;
  category?: Category;
  tags?: Tag[];
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  color: string; // Added color for tags
  order_index: number;
  created_at: string;
}

export interface PortfolioItemTag {
  id: string;
  portfolio_item_id: string;
  tag_id: string; // Added tag_id
  created_at: string;
}

export interface ABTest {
  id: string;
  video_title: string;
  version_a_url: string;
  version_b_url: string;
  order_index: number; // Added order_index
  created_at: string;
}

export interface Achievement {
  id: string;
  number: number;
  suffix: string;
  label: string;
  icon: string;
  order_index: number; // Added order_index
  created_at: string;
}

export interface Review {
  id: string;
  reviewer_name: string;
  reviewer_text: string;
  order_index: number; // Added order_index
  created_at: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  order_index: number;
  created_at: string; // Added created_at
}

export interface SiteAnalytics {
  id: string;
  visit_date: string;
  visit_count: number;
  created_at: string;
  updated_at: string; // Added updated_at
}

export interface PortfolioClick {
  id: string;
  portfolio_item_id: string;
  click_count: number;
  last_clicked_at: string;
  created_at: string; // Added created_at
}

export interface TagRequest {
  id: string;
  requested_tag: string;
  requested_at: string;
  approved: boolean;
}

export interface PrivateFormSubmission {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
}

export interface TagPreset {
  id: string;
  preset_name: string;
  tag_ids: string[];
  created_at: string;
}

export interface ProgressTracker {
  id: string;
  thumbnails_in_progress: number;
  updated_at: string;
}

// Analytics functions
export const trackSiteVisit = async () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const { error } = await supabase
      .from('site_analytics')
      .upsert({
        visit_date: today,
        visit_count: 1,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'visit_date',
        ignoreDuplicates: false
      })
      .select();
    
    if (error) throw error;
  } catch (error) {
    console.error('Error tracking site visit:', error);
  }
};

// Star functionality
export const toggleItemStar = async (itemId: string, isStarred: boolean) => {
  try {
    const { error } = await supabase
      .from('portfolio_items')
      .update({ is_starred: isStarred })
      .eq('id', itemId);

    if (error) throw error;
  } catch (error) {
    console.error('Error toggling star:', error);
    throw error;
  }
};

export const getStarredCount = async (categoryId: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('portfolio_items')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', categoryId)
      .eq('is_starred', true);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error getting starred count:', error);
    return 0;
  }
};