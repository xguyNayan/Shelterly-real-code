import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getBlogPostBySlug, BlogPost } from '../../firebase/blogService';
import { FiClock, FiCalendar, FiArrowLeft, FiTag } from 'react-icons/fi';

const BlogDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [blogPost, setBlogPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlogPost = async () => {
      if (!slug) return;
      
      try {
        setLoading(true);
        const post = await getBlogPostBySlug(slug);
        
        if (post) {
          setBlogPost(post);
        } else {
          setError('Blog post not found');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching blog post:', err);
        setError('Failed to load blog post. Please try again later.');
        setLoading(false);
      }
    };

    fetchBlogPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  if (error || !blogPost) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error || 'Blog post not found'}
        </div>
        <div className="mt-4">
          <button 
            onClick={() => navigate('/blog')} 
            className="inline-flex items-center text-primary-600 hover:text-primary-700"
          >
            <FiArrowLeft className="mr-2" />
            Back to Blog
          </button>
        </div>
      </div>
    );
  }

  // Format date
  const formattedDate = blogPost.publishedAt instanceof Date
    ? blogPost.publishedAt.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    : new Date(blogPost.publishedAt.seconds * 1000).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });

  // Convert content string to paragraphs with proper formatting
  const formatContent = (content: string) => {
    return content.split('\n\n').map((paragraph, index) => (
      <p key={index} className="mb-6 leading-relaxed">
        {paragraph}
      </p>
    ));
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link 
            to="/blog" 
            className="inline-flex items-center text-primary-600 hover:text-primary-700"
          >
            <FiArrowLeft className="mr-2" />
            Back to Blog
          </Link>
        </div>

        <article>
          <header className="mb-10">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              {blogPost.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-6">
              <div className="flex items-center">
                <FiCalendar className="mr-2" />
                <span>{formattedDate}</span>
              </div>
              
              <div className="flex items-center">
                <FiClock className="mr-2" />
                <span>{blogPost.readTime} min read</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-8">
              {blogPost.tags.map(tag => (
                <Link 
                  key={tag} 
                  to={`/blog?tag=${tag}`}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-50 text-primary-700 hover:bg-primary-100"
                >
                  <FiTag className="mr-1" size={14} />
                  {tag}
                </Link>
              ))}
            </div>
            
            <div className="flex items-center border-t border-b border-gray-200 py-4">
              <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-lg">
                {blogPost.author.charAt(0)}
              </div>
              <div className="ml-4">
                <p className="font-medium text-gray-900">{blogPost.author}</p>
                <p className="text-sm text-gray-600">Author</p>
              </div>
            </div>
          </header>

          <div className="prose prose-lg max-w-none">
            {formatContent(blogPost.content)}
          </div>
        </article>
      </div>
    </div>
  );
};

export default BlogDetail;
