import React, { useState, useEffect } from 'react';
import { Plus, CreditCard as Edit, Trash2, HelpCircle, GripVertical } from 'lucide-react';
import { supabase, FAQ } from '../../lib/supabase';

const FAQsManager: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [saving, setSaving] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    question: '',
    answer: '',
  });

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .order('order_index');

      if (error) throw error;
      setFaqs(data || []);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.question.trim() || !formData.answer.trim()) return;

    setSaving(true);
    try {
      if (editingFaq) {
        const { error } = await supabase
          .from('faqs')
          .update({
            question: formData.question.trim(),
            answer: formData.answer.trim(),
          })
          .eq('id', editingFaq.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('faqs')
          .insert({
            question: formData.question.trim(),
            answer: formData.answer.trim(),
            order_index: faqs.length,
          });

        if (error) throw error;
      }

      await fetchFAQs();
      resetForm();
    } catch (error) {
      console.error('Error saving FAQ:', error);
      alert('Error saving FAQ. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;

    try {
      const { error } = await supabase
        .from('faqs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchFAQs();
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      alert('Error deleting FAQ. Please try again.');
    }
  };

  const handleDragStart = (e: React.DragEvent, faqId: string) => {
    setDraggedItem(faqId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetFaqId: string) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem === targetFaqId) {
      setDraggedItem(null);
      return;
    }

    const draggedIndex = faqs.findIndex(faq => faq.id === draggedItem);
    const targetIndex = faqs.findIndex(faq => faq.id === targetFaqId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    // Reorder FAQs array
    const newFaqs = [...faqs];
    const [draggedFaqData] = newFaqs.splice(draggedIndex, 1);
    newFaqs.splice(targetIndex, 0, draggedFaqData);

    // Update order_index for all affected FAQs
    const updates = newFaqs.map((faq, index) => ({
      id: faq.id,
      order_index: index
    }));

    try {
      // Update in database
      for (const update of updates) {
        await supabase
          .from('faqs')
          .update({ order_index: update.order_index })
          .eq('id', update.id);
      }

      // Update local state
      setFaqs(newFaqs);
    } catch (error) {
      console.error('Error updating FAQ order:', error);
    }

    setDraggedItem(null);
  };

  const resetForm = () => {
    setFormData({ question: '', answer: '' });
    setEditingFaq(null);
    setShowModal(false);
  };

  const openEditModal = (faq: FAQ) => {
    setEditingFaq(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
    });
    setShowModal(true);
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
          <h1 className="text-2xl font-bold text-white mb-2">FAQs Manager</h1>
          <p className="text-gray-400">Manage frequently asked questions with drag-and-drop reordering</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600
                   text-white font-semibold rounded-lg hover:scale-105 transition-all duration-300"
        >
          <Plus className="w-5 h-5" />
          <span>Add FAQ</span>
        </button>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={faq.id}
            draggable
            onDragStart={(e) => handleDragStart(e, faq.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, faq.id)}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700
                     transform transition-all duration-300 hover:scale-[1.02] cursor-move relative group"
          >
            <div className="absolute left-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <GripVertical className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="ml-8">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="bg-indigo-500/20 p-2 rounded-lg">
                    <HelpCircle className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                        #{index + 1}
                      </span>
                    </div>
                    <h3 className="font-semibold text-white text-lg">{faq.question}</h3>
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => openEditModal(faq)}
                    className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30
                             transition-colors duration-300"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(faq.id)}
                    className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30
                             transition-colors duration-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <p className="text-gray-300 leading-relaxed pl-11">{faq.answer}</p>
            </div>
          </div>
        ))}
      </div>

      {faqs.length === 0 && (
        <div className="text-center py-12">
          <HelpCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-400 mb-2">No FAQs yet</h3>
          <p className="text-gray-500 mb-4">Create your first FAQ to help answer common questions</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white
                     font-semibold rounded-lg hover:scale-105 transition-all duration-300"
          >
            Add First FAQ
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingFaq ? 'Edit FAQ' : 'Add FAQ'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Question *
                </label>
                <input
                  type="text"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white
                           focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter the question..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Answer *
                </label>
                <textarea
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white
                           focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-vertical"
                  placeholder="Enter the answer..."
                  required
                />
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
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white
                           rounded-lg hover:scale-105 transition-all duration-300 disabled:opacity-50
                           disabled:cursor-not-allowed disabled:transform-none"
                >
                  {saving ? 'Saving...' : editingFaq ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FAQsManager;
