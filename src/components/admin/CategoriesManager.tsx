import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Folder, Eye, EyeOff } from 'lucide-react';
import { supabase, Category } from '../../lib/supabase';

const CategoriesManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    aspect_ratio: '16:9' as '16:9' | '1:1' | '9:16',
    is_hidden: false,
  });

  const aspectRatioOptions = [
    { value: '16:9', label: '16:9 (Thumbnails, Banners)', description: 'Standard widescreen format' },
    { value: '1:1', label: '1:1 (Logos)', description: 'Square format' },
    { value: '9:16', label: '9:16 (Shorts, Reels)', description: 'Vertical format' },
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('order_index');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setSaving(true);
    try {
      const slug = generateSlug(formData.name);

      if (editingCategory) {
        const { error } = await supabase
          .from('categories')
          .update({
            name: formData.name.trim(),
            slug,
            aspect_ratio: formData.aspect_ratio,
            is_hidden: formData.is_hidden,
          })
          .eq('id', editingCategory.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('categories')
          .insert({
            name: formData.name.trim(),
            slug,
            aspect_ratio: formData.aspect_ratio,
            is_hidden: formData.is_hidden,
            order_index: categories.length,
          });

        if (error) throw error;
      }

      await fetchCategories();
      resetForm();
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Error saving category. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? This will also delete all portfolio items in this category.')) return;

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Error deleting category. Please try again.');
    }
  };

  const toggleVisibility = async (category: Category) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update({ is_hidden: !category.is_hidden })
        .eq('id', category.id);

      if (error) throw error;
      await fetchCategories();
    } catch (error) {
      console.error('Error updating category visibility:', error);
      alert('Error updating category visibility. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', aspect_ratio: '16:9', is_hidden: false });
    setEditingCategory(null);
    setShowModal(false);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      aspect_ratio: category.aspect_ratio,
      is_hidden: category.is_hidden,
    });
    setShowModal(true);
  };

  const getAspectRatioDisplay = (ratio: string) => {
    const option = aspectRatioOptions.find(opt => opt.value === ratio);
    return option ? option.label : ratio;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Categories Manager</h1>
          <p className="text-gray-400">Manage portfolio categories with aspect ratios and visibility</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-purple-600
                   text-white font-semibold rounded-lg hover:scale-105 transition-all duration-300"
        >
          <Plus className="w-5 h-5" />
          <span>Add Category</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <div
            key={category.id}
            className={`bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700
                     transform transition-all duration-300 hover:scale-105 ${
                       category.is_hidden ? 'opacity-60' : ''
                     }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <Folder className={`w-5 h-5 ${category.is_hidden ? 'text-gray-500' : 'text-teal-400'}`} />
                <h3 className="font-semibold text-white">{category.name}</h3>
              </div>
              <button
                onClick={() => toggleVisibility(category)}
                className={`p-1 rounded transition-colors duration-300 ${
                  category.is_hidden 
                    ? 'text-gray-500 hover:text-gray-400' 
                    : 'text-teal-400 hover:text-teal-300'
                }`}
              >
                {category.is_hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-400 mb-1">Aspect Ratio</p>
              <p className="text-sm text-white">{getAspectRatioDisplay(category.aspect_ratio)}</p>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => openEditModal(category)}
                className="flex-1 flex items-center justify-center space-x-1 px-3 py-2
                         bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30
                         transition-colors duration-300"
              >
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => handleDelete(category.id)}
                className="flex-1 flex items-center justify-center space-x-1 px-3 py-2
                         bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30
                         transition-colors duration-300"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12">
          <Folder className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-400 mb-2">No categories yet</h3>
          <p className="text-gray-500 mb-4">Create your first category to organize portfolio items</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-teal-500 to-purple-600 text-white
                     font-semibold rounded-lg hover:scale-105 transition-all duration-300"
          >
            Add First Category
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingCategory ? 'Edit Category' : 'Add Category'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white
                           focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter category name..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Default Aspect Ratio *
                </label>
                <select
                  value={formData.aspect_ratio}
                  onChange={(e) => setFormData({ ...formData, aspect_ratio: e.target.value as '16:9' | '1:1' | '9:16' })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white
                           focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                >
                  {aspectRatioOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">
                  {aspectRatioOptions.find(opt => opt.value === formData.aspect_ratio)?.description}
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="is_hidden"
                  checked={formData.is_hidden}
                  onChange={(e) => setFormData({ ...formData, is_hidden: e.target.checked })}
                  className="w-4 h-4 text-teal-600 bg-gray-700 border-gray-600 rounded
                           focus:ring-teal-500 focus:ring-2"
                />
                <label htmlFor="is_hidden" className="text-sm text-gray-300">
                  Hide from public portfolio
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500
                           transition-colors duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-teal-500 to-purple-600 text-white
                           rounded-lg hover:scale-105 transition-all duration-300 disabled:opacity-50
                           disabled:cursor-not-allowed disabled:transform-none"
                >
                  {saving ? 'Saving...' : editingCategory ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesManager;