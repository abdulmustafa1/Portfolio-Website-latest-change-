import React, { useState, useEffect } from 'react';
import { Plus, Upload, Trash2, CreditCard as Edit, Image as ImageIcon, Video, GripVertical, X, Star, Filter, Search, Check } from 'lucide-react';
import { supabase, PortfolioItem, Category, Tag } from '../../lib/supabase';
import { fuzzySearchTags } from '../../utils/fuzzySearch';

const PortfolioManager: React.FC = () => {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [tagSearchQuery, setTagSearchQuery] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [presetSearchQuery, setPresetSearchQuery] = useState('');
  const [showPresetSuggestions, setShowPresetSuggestions] = useState(false);
  const [tagPresets, setTagPresets] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    category_id: '',
    tag_ids: [] as string[],
    file: null as File | null,
    is_starred: false,
  });

  useEffect(() => {
    fetchItems();
    fetchCategories();
    fetchTags();
    fetchTagPresets();
  }, []);

  // Create object URL for file preview with proper cleanup
  const objectUrl = React.useMemo(() => {
    if (formData.file) {
      return URL.createObjectURL(formData.file);
    }
    return null;
  }, [formData.file]);

  // Cleanup object URL when it changes or component unmounts
  React.useEffect(() => {
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [objectUrl]);

  // Determine the preview URL to display
  const displayPreviewUrl = objectUrl || (editingItem?.file_url);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('portfolio_items')
        .select(`
          *,
          category:categories(*),
          portfolio_item_tags(
            tag:tags(*)
          )
        `)
        .order('order_index');

      if (error) throw error;
      
      // Transform the data to include tags array
      const itemsWithTags = (data || []).map(item => ({
        ...item,
        tags: item.portfolio_item_tags?.map((pit: any) => pit.tag) || []
      }));
      
      setItems(itemsWithTags);
    } catch (error) {
      console.error('Error fetching portfolio items:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItemsForDisplay = React.useMemo(() => {
    if (filterCategory === 'all') return items;
    return items.filter(item => item.category?.slug === filterCategory);
  }, [items, filterCategory]);

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
    }
  };

  const fetchTags = async () => {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('order_index');

      if (error) throw error;
      setTags(data || []);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const fetchTagPresets = async () => {
    try {
      const { data, error } = await supabase
        .from('tag_presets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTagPresets(data || []);
    } catch (error) {
      console.error('Error fetching tag presets:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData({ ...formData, file });
  };

  const uploadFile = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `portfolio/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('portfolio')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('portfolio')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const updateItemTags = async (itemId: string, tagIds: string[]) => {
    // First, delete existing tags for this item
    await supabase
      .from('portfolio_item_tags')
      .delete()
      .eq('portfolio_item_id', itemId);

    // Then, insert new tags
    if (tagIds.length > 0) {
      const tagInserts = tagIds.map(tagId => ({
        portfolio_item_id: itemId,
        tag_id: tagId
      }));

      await supabase
        .from('portfolio_item_tags')
        .insert(tagInserts);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!formData.file && !editingItem) || !formData.category_id) return;

    setUploading(true);
    try {
      let fileUrl = editingItem?.file_url;
      let fileType = editingItem?.file_type;

      if (formData.file) {
        fileUrl = await uploadFile(formData.file);
        fileType = formData.file.type.startsWith('video/') ? 'video' : 'image';
      }

      if (editingItem) {
        const { error } = await supabase
          .from('portfolio_items')
          .update({
            ...(fileUrl && { file_url: fileUrl }),
            ...(fileType && { file_type: fileType }),
            category_id: formData.category_id,
            is_starred: formData.is_starred,
          })
          .eq('id', editingItem.id);

        if (error) throw error;
        await updateItemTags(editingItem.id, formData.tag_ids);
      } else {
        const { data: newItem, error } = await supabase
          .from('portfolio_items')
          .insert({
            file_url: fileUrl!,
            file_type: fileType as 'image' | 'video',
            category_id: formData.category_id,
            order_index: items.length,
            is_starred: formData.is_starred,
          })
          .select()
          .single();

        if (error) throw error;
        if (newItem) {
          await updateItemTags(newItem.id, formData.tag_ids);
        }
      }

      await fetchItems();
      resetForm();
    } catch (error) {
      console.error('Error saving portfolio item:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const { error } = await supabase
        .from('portfolio_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchItems();
    } catch (error) {
      console.error('Error deleting portfolio item:', error);
    }
  };

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setDraggedItem(itemId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetItemId: string) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem === targetItemId) {
      setDraggedItem(null);
      return;
    }

    const draggedIndex = items.findIndex(item => item.id === draggedItem);
    const targetIndex = items.findIndex(item => item.id === targetItemId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    // Reorder items array
    const newItems = [...items];
    const [draggedItemData] = newItems.splice(draggedIndex, 1);
    newItems.splice(targetIndex, 0, draggedItemData);

    // Update order_index for all affected items
    const updates = newItems.map((item, index) => ({
      id: item.id,
      order_index: index
    }));

    try {
      // Update in database
      for (const update of updates) {
        await supabase
          .from('portfolio_items')
          .update({ order_index: update.order_index })
          .eq('id', update.id);
      }

      // Update local state
      setItems(newItems);
    } catch (error) {
      console.error('Error updating item order:', error);
    }

    setDraggedItem(null);
  };

  const filteredTagsForSearch = React.useMemo(() => {
    if (!tagSearchQuery.trim()) return tags;
    return fuzzySearchTags(tags, tagSearchQuery);
  }, [tags, tagSearchQuery]);

  const filteredPresetsForSearch = React.useMemo(() => {
    if (!presetSearchQuery.trim()) return tagPresets;
    return tagPresets.filter(preset => 
      preset.preset_name.toLowerCase().includes(presetSearchQuery.toLowerCase())
    );
  }, [tagPresets, presetSearchQuery]);

  const handleTagSearch = (query: string) => {
    setTagSearchQuery(query);
    setShowTagSuggestions(query.length > 0);
  };

  const handleTagSelect = (tagId: string) => {
    if (!formData.tag_ids.includes(tagId)) {
      setFormData({
        ...formData,
        tag_ids: [...formData.tag_ids, tagId]
      });
    }
    setTagSearchQuery('');
    setShowTagSuggestions(false);
  };

  const handleTagRemove = (tagId: string) => {
    setFormData({
      ...formData,
      tag_ids: formData.tag_ids.filter(id => id !== tagId)
    });
  };

  const handlePresetSearch = (query: string) => {
    setPresetSearchQuery(query);
    setShowPresetSuggestions(query.length > 0);
  };

  const handlePresetSelect = (preset: any) => {
    // Add all tags from the preset to the current selection
    const newTagIds = [...new Set([...formData.tag_ids, ...preset.tag_ids])];
    setFormData({
      ...formData,
      tag_ids: newTagIds
    });
    setPresetSearchQuery('');
    setShowPresetSuggestions(false);
  };

  const resetForm = () => {
    setFormData({ category_id: '', tag_ids: [], file: null, is_starred: false });
    setEditingItem(null);
    setShowModal(false);
    setTagSearchQuery('');
    setShowTagSuggestions(false);
    setPresetSearchQuery('');
    setShowPresetSuggestions(false);
  };

  const openEditModal = (item: PortfolioItem) => {
    setEditingItem(item);
    setFormData({
      category_id: item.category_id,
      tag_ids: item.tags?.map(tag => tag.id) || [],
      file: null,
      is_starred: item.is_starred || false,
    });
    setShowModal(true);
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
          <h1 className="text-2xl font-bold text-white mb-2">Portfolio Manager</h1>
          <p className="text-gray-400">Manage your portfolio items and media</p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Category Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm
                       focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-purple-600
                     text-white font-semibold rounded-lg hover:scale-105 transition-all duration-300"
          >
            <Plus className="w-5 h-5" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItemsForDisplay.map((item) => (
          <div
            key={item.id}
            draggable
            onDragStart={(e) => handleDragStart(e, item.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, item.id)}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden
                     transform transition-all duration-300 hover:scale-105 cursor-move relative group"
          >
            <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <GripVertical className="w-5 h-5 text-white bg-black/50 rounded p-1" />
            </div>
            
            <div className="absolute top-2 right-2 z-10">
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  try {
                    const { error } = await supabase
                      .from('portfolio_items')
                      .update({ is_starred: !item.is_starred })
                      .eq('id', item.id);
                    
                    if (error) throw error;
                    await fetchItems();
                  } catch (error) {
                    console.error('Error toggling star:', error);
                  }
                }}
                className={`p-1 rounded-full transition-all duration-300 ${
                  item.is_starred 
                    ? 'bg-yellow-500 text-white' 
                    : 'bg-black/50 text-white hover:bg-yellow-500'
                }`}
              >
                <Star className={`w-4 h-4 ${item.is_starred ? 'fill-current' : ''}`} />
              </button>
            </div>
            
            <div className={`relative ${getAspectRatioClass(item.category?.aspect_ratio || '16:9')} bg-gray-700`}>
              {item.file_type === 'video' ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Video className="w-12 h-12 text-gray-400" />
                </div>
              ) : (
                <img
                  src={item.file_url}
                  alt={item.title || 'Portfolio item'}
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute top-2 right-2">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  item.file_type === 'video' 
                    ? 'bg-purple-500/80 text-white' 
                    : 'bg-teal-500/80 text-white'
                }`}>
                  {item.file_type}
                </span>
              </div>
            </div>
            
            <div className="p-4">
              <p className="text-sm text-gray-400 mb-3">
                {item.category?.name || 'No category'}
              </p>
              
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {item.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="px-2 py-1 text-xs rounded-full text-white"
                      style={{ backgroundColor: tag.color }}
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="flex space-x-2">
                <button
                  onClick={() => openEditModal(item)}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2
                           bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30
                           transition-colors duration-300"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2
                           bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30
                           transition-colors duration-300"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl w-full max-w-md border border-gray-700 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">
              {editingItem ? 'Edit Portfolio Item' : 'Add Portfolio Item'}
            </h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleSubmit} className="space-y-4" id="portfolio-form">

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white
                           focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="is_starred"
                  checked={formData.is_starred}
                  onChange={(e) => setFormData({ ...formData, is_starred: e.target.checked })}
                  className="w-4 h-4 text-yellow-600 bg-gray-700 border-gray-600 rounded
                           focus:ring-yellow-500 focus:ring-2"
                />
                <label htmlFor="is_starred" className="text-sm text-gray-300 flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>Mark as Popular (Starred)</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  File *
                </label>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white
                           focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required={!editingItem}
                />
                {displayPreviewUrl && (
                  <div className="mt-2 relative">
                    <img
                      src={displayPreviewUrl}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, file: null });
                      }}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600
                               transition-colors duration-300"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tags & Presets
                </label>
                
                {/* Tag Presets Search */}
                <div className="mb-4">
                  <p className="text-xs text-gray-400 mb-2">Quick Apply Presets:</p>
                  <div className="relative">
                    <input
                      type="text"
                      value={presetSearchQuery}
                      onChange={(e) => handlePresetSearch(e.target.value)}
                      onFocus={() => setShowPresetSuggestions(presetSearchQuery.length > 0)}
                      className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white
                               placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Search for tag presets..."
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />

                    {/* Preset Suggestions Dropdown */}
                    {showPresetSuggestions && (
                      <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg max-h-32 overflow-y-auto">
                        {filteredPresetsForSearch.length > 0 ? (
                          filteredPresetsForSearch.map((preset) => (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() => handlePresetSelect(preset)}
                              className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-gray-600 
                                       transition-colors duration-200 cursor-pointer"
                            >
                              <div className="w-3 h-3 bg-purple-500 rounded-full flex-shrink-0" />
                              <span className="text-sm text-gray-300 flex-1">{preset.preset_name}</span>
                              <span className="text-xs text-gray-500">({preset.tag_ids.length} tags)</span>
                            </button>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-sm text-gray-400">
                            No presets found.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Selected Tags */}
                {formData.tag_ids.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-400 mb-2">Selected Tags:</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.tag_ids.map((tagId) => {
                        const tag = tags.find(t => t.id === tagId);
                        if (!tag) return null;
                        return (
                          <span
                            key={tagId}
                            className="inline-flex items-center space-x-1 px-2 py-1 text-xs rounded-full text-white"
                            style={{ backgroundColor: tag.color }}
                          >
                            <span>{tag.name}</span>
                            <button
                              type="button"
                              onClick={() => handleTagRemove(tagId)}
                              className="ml-1 hover:bg-black/20 rounded-full p-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Tag Search */}
                <div className="relative">
                  <p className="text-xs text-gray-400 mb-2">Individual Tags:</p>
                  <div className="relative">
                    <input
                      type="text"
                      value={tagSearchQuery}
                      onChange={(e) => handleTagSearch(e.target.value)}
                      onFocus={() => setShowTagSuggestions(tagSearchQuery.length > 0)}
                      className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white
                               placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Search for tags..."
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>

                  {/* Tag Suggestions Dropdown */}
                  {showTagSuggestions && (
                    <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                      {filteredTagsForSearch.length > 0 ? (
                        filteredTagsForSearch.map((tag) => (
                          <button
                            key={tag.id}
                            type="button"
                            onClick={() => handleTagSelect(tag.id)}
                            disabled={formData.tag_ids.includes(tag.id)}
                            className={`w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-gray-600 
                                     transition-colors duration-200 ${
                                       formData.tag_ids.includes(tag.id) 
                                         ? 'opacity-50 cursor-not-allowed' 
                                         : 'cursor-pointer'
                                     }`}
                          >
                            <div
                              className="w-3 h-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: tag.color }}
                            />
                            <span className="text-sm text-gray-300 flex-1">{tag.name}</span>
                            {formData.tag_ids.includes(tag.id) && (
                              <Check className="w-4 h-4 text-teal-400" />
                            )}
                          </button>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-sm text-gray-400">
                          Tag not found.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              </form>
            </div>

            <div className="p-6 border-t border-gray-700">
              <div className="flex space-x-3">
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
                  form="portfolio-form"
                  disabled={uploading}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-teal-500 to-purple-600 text-white
                           rounded-lg hover:scale-105 transition-all duration-300 disabled:opacity-50
                           disabled:cursor-not-allowed disabled:transform-none"
                >
                  {uploading ? 'Uploading...' : editingItem ? 'Update' : 'Add'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioManager;