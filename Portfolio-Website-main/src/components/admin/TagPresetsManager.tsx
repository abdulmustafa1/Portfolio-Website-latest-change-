import React, { useState, useEffect } from 'react';
import { Plus, CreditCard as Edit, Trash2, Tag as TagIcon, Package, Search, Check, X } from 'lucide-react';
import { supabase, TagPreset, Tag } from '../../lib/supabase';
import { fuzzySearchTags } from '../../utils/fuzzySearch';

const TagPresetsManager: React.FC = () => {
  const [presets, setPresets] = useState<TagPreset[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPreset, setEditingPreset] = useState<TagPreset | null>(null);
  const [saving, setSaving] = useState(false);
  const [tagSearchQuery, setTagSearchQuery] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);

  const [formData, setFormData] = useState({
    preset_name: '',
    tag_ids: [] as string[],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [presetsResult, tagsResult] = await Promise.all([
        supabase.from('tag_presets').select('*').order('created_at', { ascending: false }),
        supabase.from('tags').select('*').order('order_index'),
      ]);

      if (presetsResult.error) throw presetsResult.error;
      if (tagsResult.error) throw tagsResult.error;

      setPresets(presetsResult.data || []);
      setTags(tagsResult.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.preset_name.trim() || formData.tag_ids.length === 0) {
      alert('Please enter a preset name and select at least one tag');
      return;
    }

    setSaving(true);
    try {
      if (editingPreset) {
        const { error } = await supabase
          .from('tag_presets')
          .update({
            preset_name: formData.preset_name.trim(),
            tag_ids: formData.tag_ids,
          })
          .eq('id', editingPreset.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('tag_presets')
          .insert({
            preset_name: formData.preset_name.trim(),
            tag_ids: formData.tag_ids,
          });

        if (error) throw error;
      }

      await fetchData();
      resetForm();
    } catch (error) {
      console.error('Error saving preset:', error);
      alert('Error saving preset. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tag preset?')) return;

    try {
      const { error } = await supabase
        .from('tag_presets')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchData();
    } catch (error) {
      console.error('Error deleting preset:', error);
      alert('Error deleting preset. Please try again.');
    }
  };

  const filteredTagsForSearch = React.useMemo(() => {
    if (!tagSearchQuery.trim()) return tags;
    return fuzzySearchTags(tags, tagSearchQuery);
  }, [tags, tagSearchQuery]);

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

  const resetForm = () => {
    setFormData({ preset_name: '', tag_ids: [] });
    setEditingPreset(null);
    setShowModal(false);
    setTagSearchQuery('');
    setShowTagSuggestions(false);
  };

  const openEditModal = (preset: TagPreset) => {
    setEditingPreset(preset);
    setFormData({
      preset_name: preset.preset_name,
      tag_ids: preset.tag_ids,
    });
    setShowModal(true);
  };

  const getTagsForPreset = (tagIds: string[]) => {
    return tags.filter(tag => tagIds.includes(tag.id));
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
          <h1 className="text-2xl font-bold text-white mb-2">Tag Presets</h1>
          <p className="text-gray-400">Create and manage tag presets for bulk tagging</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600
                   text-white font-semibold rounded-lg hover:scale-105 transition-all duration-300"
        >
          <Plus className="w-5 h-5" />
          <span>Add Preset</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {presets.map((preset) => {
          const presetTags = getTagsForPreset(preset.tag_ids);
          return (
            <div
              key={preset.id}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700
                       transform transition-all duration-300 hover:scale-105"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <Package className="w-5 h-5 text-purple-400" />
                  <h3 className="font-semibold text-white">{preset.preset_name}</h3>
                </div>
                <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                  {presetTags.length} tags
                </span>
              </div>
              
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {presetTags.slice(0, 6).map((tag) => (
                    <span
                      key={tag.id}
                      className="px-2 py-1 text-xs rounded-full text-white"
                      style={{ backgroundColor: tag.color }}
                    >
                      {tag.name}
                    </span>
                  ))}
                  {presetTags.length > 6 && (
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-600 text-gray-300">
                      +{presetTags.length - 6} more
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => openEditModal(preset)}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2
                           bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30
                           transition-colors duration-300"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(preset.id)}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2
                           bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30
                           transition-colors duration-300"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {presets.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-400 mb-2">No tag presets yet</h3>
          <p className="text-gray-500 mb-4">Create your first tag preset for bulk tagging</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white
                     font-semibold rounded-lg hover:scale-105 transition-all duration-300"
          >
            Add First Preset
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700 max-h-[90vh] flex flex-col">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingPreset ? 'Edit Tag Preset' : 'Add Tag Preset'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Preset Name *
                </label>
                <input
                  type="text"
                  value={formData.preset_name}
                  onChange={(e) => setFormData({ ...formData, preset_name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white
                           focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter preset name..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tags *
                </label>
                
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
                  <div className="relative">
                    <input
                      type="text"
                      value={tagSearchQuery}
                      onChange={(e) => handleTagSearch(e.target.value)}
                      onFocus={() => setShowTagSuggestions(tagSearchQuery.length > 0)}
                      className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white
                               placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                              <Check className="w-4 h-4 text-purple-400" />
                            )}
                          </button>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-sm text-gray-400">
                          No tags found.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </form>

            <div className="flex space-x-3 pt-4 border-t border-gray-700 mt-4">
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
                onClick={handleSubmit}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white
                         rounded-lg hover:scale-105 transition-all duration-300 disabled:opacity-50
                         disabled:cursor-not-allowed disabled:transform-none"
              >
                {saving ? 'Saving...' : editingPreset ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TagPresetsManager;