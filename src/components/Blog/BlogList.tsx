import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPublishedBlogPosts, BlogPost } from '../../firebase/blogService';
import { FiClock, FiCalendar, FiTag } from 'react-icons/fi';

const BlogList: React.FC = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        setLoading(true);
        const posts = await getPublishedBlogPosts();
        setBlogPosts(posts);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching blog posts:', err);
        setError('Failed to load blog posts. Please try again later.');
        setLoading(false);
      }
    };

    fetchBlogPosts();
  }, []);

  // Get all unique tags from blog posts
  const allTags = Array.from(
    new Set(blogPosts.flatMap(post => post.tags))
  ).sort();

  // Filter posts by active tag if one is selected
  const filteredPosts = activeTag
    ? blogPosts.filter(post => post.tags.includes(activeTag))
    : blogPosts;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Shelterly Blog</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Insights, tips, and stories about student accommodation and college life in India
        </p>
      </div>

      {/* Tags filter */}
      {allTags.length > 0 && (
        <div className="mb-12">
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setActiveTag(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTag === null
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeTag === tag
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Blog posts grid */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No blog posts found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map(post => (
            <Link
              key={post.id}
              to={`/blog/${post.slug}`}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
                    {post.author.charAt(0)}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{post.author}</p>
                    <div className="flex items-center text-xs text-gray-500">
                      <FiCalendar className="mr-1" />
                      {post.publishedAt instanceof Date
                        ? post.publishedAt.toLocaleDateString()
                        : new Date(post.publishedAt.seconds * 1000).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{post.title}</h2>
                <p className="text-gray-600 mb-4 line-clamp-3">{post.summary}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <FiClock className="mr-1" />
                    <span>{post.readTime} min read</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {post.tags.slice(0, 2).map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700"
                      >
                        <FiTag className="mr-1" size={10} />
                        {tag}
                      </span>
                    ))}
                    {post.tags.length > 2 && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        +{post.tags.length - 2}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogList;
