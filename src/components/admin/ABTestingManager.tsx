import React, { useState, useEffect } from "react";
import { Plus, CreditCard as Edit, Trash2, TestTube, X } from "lucide-react";
import { supabase } from "../../lib/supabase"; // ✅ Fixed import
import type { ABTest } from "../../lib/supabase"; // ✅ If you export types separately

const ABTestingManager: React.FC = () => {
  const [abTests, setAbTests] = useState<ABTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTest, setEditingTest] = useState<ABTest | null>(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    video_title: "",
    version_a_file: null as File | null,
    version_b_file: null as File | null,
  });

  const [previews, setPreviews] = useState({
    version_a: null as string | null,
    version_b: null as string | null,
  });

  useEffect(() => {
    fetchABTests();
  }, []);

  const fetchABTests = async () => {
    try {
      const { data, error } = await supabase
        .from("ab_tests")
        .select("*")
        .order("order_index", { ascending: true }); // ✅ added sorting direction

      if (error) throw error;
      setAbTests(data || []);
    } catch (error) {
      console.error("Error fetching A/B tests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (
    version: "version_a" | "version_b",
    file: File | null
  ) => {
    const propertyName = `${version}_file` as keyof typeof formData;
    setFormData({
      ...formData,
      [propertyName]: file,
    });

    if (file) {
      const url = URL.createObjectURL(file);
      setPreviews({ ...previews, [version]: url });
    } else {
      setPreviews({ ...previews, [version]: null });
    }
  };

  const uploadFile = async (file: File, prefix: string): Promise<string> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${prefix}_${Date.now()}.${fileExt}`;
    const filePath = `ab-tests/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("portfolio")
      .upload(filePath, file, {
        upsert: true, // ✅ allows replacing existing file (optional)
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from("portfolio")
      .getPublicUrl(filePath);

    if (!data?.publicUrl) throw new Error("Failed to get public URL");
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.video_title.trim()) return;

    if (!editingTest && (!formData.version_a_file || !formData.version_b_file)) {
      alert("Both Version A and Version B images are required");
      return;
    }

    setUploading(true);
    try {
      let versionAUrl = editingTest?.version_a_url;
      let versionBUrl = editingTest?.version_b_url;

      if (formData.version_a_file) {
        versionAUrl = await uploadFile(formData.version_a_file, "version_a");
      }

      if (formData.version_b_file) {
        versionBUrl = await uploadFile(formData.version_b_file, "version_b");
      }

      if (editingTest) {
        const { error } = await supabase
          .from("ab_tests")
          .update({
            video_title: formData.video_title.trim(),
            version_a_url: versionAUrl,
            version_b_url: versionBUrl,
          })
          .eq("id", editingTest.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("ab_tests").insert({
          video_title: formData.video_title.trim(),
          version_a_url: versionAUrl!,
          version_b_url: versionBUrl!,
          order_index: abTests.length,
        });

        if (error) throw error;
      }

      await fetchABTests();
      resetForm();
    } catch (error) {
      console.error("Error saving A/B test:", error);
      alert("Error saving A/B test. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this A/B test?")) return;

    try {
      const { error } = await supabase.from("ab_tests").delete().eq("id", id);
      if (error) throw error;
      await fetchABTests();
    } catch (error) {
      console.error("Error deleting A/B test:", error);
      alert("Error deleting A/B test. Please try again.");
    }
  };

  const resetForm = () => {
    setFormData({
      video_title: "",
      version_a_file: null,
      version_b_file: null,
    });
    setPreviews({
      version_a: null,
      version_b: null,
    });
    setEditingTest(null);
    setShowModal(false);
  };

  const openEditModal = (test: ABTest) => {
    setEditingTest(test);
    setFormData({
      video_title: test.video_title,
      version_a_file: null,
      version_b_file: null,
    });
    setPreviews({
      version_a: test.version_a_url,
      version_b: test.version_b_url,
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">A/B Testing Manager</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add A/B Test
        </button>
      </div>

      {/* A/B Tests Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {abTests.map((test) => (
          <div key={test.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-800">{test.video_title}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(test)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(test.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Version A</p>
                <div className="w-full aspect-video bg-gray-100 rounded overflow-hidden">
                  <img
                    src={test.version_a_url}
                    alt="Version A"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Version B</p>
                <div className="w-full aspect-video bg-gray-100 rounded overflow-hidden">
                  <img
                    src={test.version_b_url}
                    alt="Version B"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingTest ? "Edit A/B Test" : "Add A/B Test"}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Video Title
                </label>
                <input
                  type="text"
                  value={formData.video_title}
                  onChange={(e) =>
                    setFormData({ ...formData, video_title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Version A Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleFileChange("version_a", e.target.files?.[0] || null)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                {previews.version_a && (
                  <img
                    src={previews.version_a}
                    alt="Version A Preview"
                    className="mt-2 w-full aspect-video object-contain bg-gray-100 rounded"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Version B Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleFileChange("version_b", e.target.files?.[0] || null)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                {previews.version_b && (
                  <img
                    src={previews.version_b}
                    alt="Version B Preview"
                    className="mt-2 w-full aspect-video object-contain bg-gray-100 rounded"
                  />
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <TestTube className="w-4 h-4" />
                      {editingTest ? "Update" : "Create"} Test
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ABTestingManager;