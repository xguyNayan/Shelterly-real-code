import React, { useState, useEffect } from 'react';
import { 
  getAllBlogPosts, 
  createBlogPost, 
  updateBlogPost, 
  deleteBlogPost, 
  BlogPost, 
  generateSlug, 
  calculateReadTime 
} from '../../firebase/blogService';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FiEdit2, 
  FiTrash2, 
  FiPlus, 
  FiX, 
  FiCheck, 
  FiEye, 
  FiEyeOff, 
  FiSearch,
  FiCalendar,
  FiTag
} from 'react-icons/fi';
import { Timestamp } from 'firebase/firestore';

const BlogAdmin: React.FC = () => {
  const { userProfile } = useAuth();
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePostId, setDeletePostId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Form state
  const [formData, setFormData] = useState<Omit<BlogPost, 'id'>>({
    title: '',
    content: '',
    summary: '',
    slug: '',
    author: userProfile.displayName || '',
    authorId: userProfile.uid || '',
    publishedAt: new Date(),
    updatedAt: new Date(),
    published: false,
    tags: [],
    readTime: 1
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const fetchBlogPosts = async () => {
    try {
      setLoading(true);
      const posts = await getAllBlogPosts();
      setBlogPosts(posts);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching blog posts:', err);
      setError('Failed to load blog posts. Please try again later.');
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'title') {
      // Auto-generate slug from title
      setFormData({
        ...formData,
        title: value,
        slug: generateSlug(value)
      });
    } else if (name === 'content') {
      // Calculate read time when content changes
      setFormData({
        ...formData,
        content: value,
        readTime: calculateReadTime(value)
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag)
    });
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handlePublishToggle = () => {
    setFormData({
      ...formData,
      published: !formData.published
    });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      summary: '',
      slug: '',
      author: userProfile.displayName || '',
      authorId: userProfile.uid || '',
      publishedAt: new Date(),
      updatedAt: new Date(),
      published: false,
      tags: [],
      readTime: 1
    });
    setTagInput('');
    setEditingPost(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    resetForm();
  };

  const handleEditPost = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      summary: post.summary,
      slug: post.slug,
      author: post.author,
      authorId: post.authorId,
      publishedAt: post.publishedAt,
      updatedAt: new Date(),
      published: post.published,
      tags: post.tags,
      readTime: post.readTime
    });
    setShowAddModal(true);
  };

  const handleDeleteClick = (postId: string) => {
    setDeletePostId(postId);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletePostId) return;
    
    try {
      await deleteBlogPost(deletePostId);
      setBlogPosts(blogPosts.filter(post => post.id !== deletePostId));
      setSuccessMessage('Blog post deleted successfully');
      setShowDeleteModal(false);
      setDeletePostId(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error deleting blog post:', err);
      setError('Failed to delete blog post. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingPost && editingPost.id) {
        // Update existing post
        await updateBlogPost(editingPost.id, formData);
        setBlogPosts(
          blogPosts.map(post => 
            post.id === editingPost.id ? { ...formData, id: editingPost.id } : post
          )
        );
        setSuccessMessage('Blog post updated successfully');
      } else {
        // Create new post
        const newPostId = await createBlogPost({
          ...formData,
          publishedAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
        setBlogPosts([
          { ...formData, id: newPostId },
          ...blogPosts
        ]);
        setSuccessMessage('Blog post created successfully');
      }
      
      setShowAddModal(false);
      resetForm();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error saving blog post:', err);
      setError('Failed to save blog post. Please try again.');
    }
  };

  // Filter posts based on search query
  const filteredPosts = blogPosts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Format date for display
  const formatDate = (timestamp: Timestamp | Date) => {
    if (timestamp instanceof Date) {
      return timestamp.toLocaleDateString();
    }
    return new Date(timestamp.seconds * 1000).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-xl font-semibold text-gray-800">Manage Blog Posts</h2>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search blog posts..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          
          <button
            onClick={handleOpenAddModal}
            className="bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600 flex items-center justify-center whitespace-nowrap"
          >
            <FiPlus className="mr-2" /> New Post
          </button>
        </div>
      </div>
      
      {/* Success message */}
      {successMessage && (
        <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative flex items-center justify-between">
          <span>{successMessage}</span>
          <button 
            onClick={() => setSuccessMessage('')}
            className="text-green-700"
          >
            <FiX size={18} />
          </button>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative flex items-center justify-between">
          <span>{error}</span>
          <button 
            onClick={() => setError('')}
            className="text-red-700"
          >
            <FiX size={18} />
          </button>
        </div>
      )}
      
      {/* Blog posts table */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No blog posts found. Click "New Post" to create your first blog post.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Author</th>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Date</th>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPosts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 line-clamp-1">{post.title}</div>
                    <div className="text-xs text-gray-500 md:hidden">{post.author}</div>
                  </td>
                  <td className="px-3 md:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                    <div className="text-sm text-gray-500">{post.author}</div>
                  </td>
                  <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                    {formatDate(post.publishedAt)}
                  </td>
                  <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      post.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {post.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEditPost(post)}
                        className="text-indigo-600 hover:text-indigo-900 p-1"
                        title="Edit post"
                      >
                        <FiEdit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(post.id!)}
                        className="text-red-600 hover:text-red-900 p-1"
                        title="Delete post"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center border-b px-6 py-4">
              <h3 className="text-xl font-semibold text-gray-900">
                {editingPost ? 'Edit Blog Post' : 'Create New Blog Post'}
              </h3>
              <button 
                onClick={handleCloseAddModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <FiX size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-6">
                  {/* Title */}
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={formData.title}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  {/* Slug */}
                  <div>
                    <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                      Slug *
                    </label>
                    <input
                      type="text"
                      id="slug"
                      name="slug"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={formData.slug}
                      onChange={handleInputChange}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      URL-friendly version of the title. Auto-generated but can be edited.
                    </p>
                  </div>
                  
                  {/* Summary */}
                  <div>
                    <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-1">
                      Summary *
                    </label>
                    <textarea
                      id="summary"
                      name="summary"
                      required
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={formData.summary}
                      onChange={handleInputChange}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      A brief summary that appears in blog listings (150-200 characters recommended).
                    </p>
                  </div>
                  
                  {/* Content */}
                  <div>
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                      Content *
                    </label>
                    <textarea
                      id="content"
                      name="content"
                      required
                      rows={10}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
                      value={formData.content}
                      onChange={handleInputChange}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Use double line breaks for new paragraphs. Estimated read time: {formData.readTime} min.
                    </p>
                  </div>
                  
                  {/* Tags */}
                  <div>
                    <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                      Tags
                    </label>
                    <div className="flex items-center">
                      <input
                        type="text"
                        id="tags"
                        className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        value={tagInput}
                        onChange={handleTagInputChange}
                        onKeyPress={handleTagKeyPress}
                        placeholder="Add a tag and press Enter"
                      />
                      <button
                        type="button"
                        onClick={handleAddTag}
                        className="px-4 py-2 bg-primary-500 text-white rounded-r-md hover:bg-primary-600"
                      >
                        Add
                      </button>
                    </div>
                    
                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {formData.tags.map(tag => (
                          <span 
                            key={tag}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-50 text-primary-700"
                          >
                            <FiTag className="mr-1" size={12} />
                            {tag}
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
                              className="ml-1 text-primary-700 hover:text-primary-900"
                            >
                              <FiX size={14} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Published status */}
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={handlePublishToggle}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                        formData.published ? 'bg-primary-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          formData.published ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <span className="ml-3 text-sm font-medium text-gray-700">
                      {formData.published ? (
                        <span className="flex items-center text-green-700">
                          <FiEye className="mr-1" /> Published
                        </span>
                      ) : (
                        <span className="flex items-center text-gray-500">
                          <FiEyeOff className="mr-1" /> Draft
                        </span>
                      )}
                    </span>
                  </div>
                </div>
                
                <div className="mt-8 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCloseAddModal}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 flex items-center"
                  >
                    <FiCheck className="mr-2" />
                    {editingPost ? 'Update Post' : 'Create Post'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Deletion</h3>
              <p className="text-gray-500 mb-6">
                Are you sure you want to delete this blog post? This action cannot be undone.
              </p>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogAdmin;
