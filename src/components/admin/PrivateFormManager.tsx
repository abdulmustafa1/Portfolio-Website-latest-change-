import React, { useState, useEffect } from 'react';
import { Mail, Trash2, MessageSquare, Calendar } from 'lucide-react';
import { supabase, PrivateFormSubmission } from '../../lib/supabase';

const PrivateFormManager: React.FC = () => {
  const [submissions, setSubmissions] = useState<PrivateFormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<PrivateFormSubmission | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('private_form_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this submission?')) return;

    try {
      const { error } = await supabase
        .from('private_form_submissions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchSubmissions();
      if (selectedSubmission?.id === id) {
        setSelectedSubmission(null);
      }
    } catch (error) {
      console.error('Error deleting submission:', error);
      alert('Error deleting submission. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Private Form Entries</h1>
        <p className="text-gray-400">Manage contact form submissions from the private area</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Submissions List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Submissions ({submissions.length})</h2>
          
          {submissions.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {submissions.map((submission) => (
                <div
                  key={submission.id}
                  onClick={() => setSelectedSubmission(submission)}
                  className={`bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border cursor-pointer
                           transform transition-all duration-300 hover:scale-[1.02] ${
                    selectedSubmission?.id === submission.id
                      ? 'border-teal-500 bg-teal-500/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-teal-400" />
                      <h3 className="font-semibold text-white">{submission.name}</h3>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(submission.id);
                      }}
                      className="p-1 text-red-400 hover:text-red-300 transition-colors duration-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <p className="text-sm text-gray-400 mb-2">{submission.email}</p>
                  <p className="text-sm text-gray-300 line-clamp-2 mb-2">
                    {submission.message}
                  </p>
                  
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(submission.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-400 mb-2">No submissions yet</h3>
              <p className="text-gray-500">Contact form submissions will appear here</p>
            </div>
          )}
        </div>

        {/* Submission Details */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          {selectedSubmission ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Submission Details</h2>
                <button
                  onClick={() => handleDelete(selectedSubmission.id)}
                  className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30
                           transition-colors duration-300"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                  <p className="text-white bg-gray-700/50 p-3 rounded-lg">{selectedSubmission.name}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                  <p className="text-white bg-gray-700/50 p-3 rounded-lg">
                    <a 
                      href={`mailto:${selectedSubmission.email}`}
                      className="text-teal-400 hover:text-teal-300 transition-colors duration-300"
                    >
                      {selectedSubmission.email}
                    </a>
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Message</label>
                  <div className="text-white bg-gray-700/50 p-3 rounded-lg max-h-40 overflow-y-auto">
                    {selectedSubmission.message}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Submitted</label>
                  <p className="text-white bg-gray-700/50 p-3 rounded-lg">
                    {formatDate(selectedSubmission.created_at)}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-400 mb-2">Select a Submission</h3>
              <p className="text-gray-500">Click on a submission to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrivateFormManager;