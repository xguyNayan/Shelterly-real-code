import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, getDoc, query, orderBy, Timestamp, where } from 'firebase/firestore';
import { db } from './config';

export interface BlogPost {
  id?: string;
  title: string;
  content: string;
  summary: string;
  slug: string;
  author: string;
  authorId: string;
  publishedAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  published: boolean;
  tags: string[];
  readTime: number; // in minutes
}

// Create a new blog post
export const createBlogPost = async (blogPost: Omit<BlogPost, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'blogPosts'), {
      ...blogPost,
      publishedAt: blogPost.publishedAt || Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating blog post:', error);
    throw error;
  }
};

// Update an existing blog post
export const updateBlogPost = async (id: string, blogPost: Partial<BlogPost>): Promise<void> => {
  try {
    const blogRef = doc(db, 'blogPosts', id);
    await updateDoc(blogRef, {
      ...blogPost,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating blog post:', error);
    throw error;
  }
};

// Delete a blog post
export const deleteBlogPost = async (id: string): Promise<void> => {
  try {
    const blogRef = doc(db, 'blogPosts', id);
    await deleteDoc(blogRef);
  } catch (error) {
    console.error('Error deleting blog post:', error);
    throw error;
  }
};

// Sample blog posts to use when Firestore permissions fail
const sampleBlogPosts: BlogPost[] = [
  {
    id: 'sample-1',
    title: 'Finding the Perfect PG Accommodation: A Student Guide',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    summary: 'A comprehensive guide to help students find their ideal PG accommodation with tips on location, amenities, and budget considerations.',
    slug: 'finding-perfect-pg-accommodation',
    author: 'Rahul Sharma',
    authorId: 'author-1',
    publishedAt: Timestamp.fromDate(new Date('2025-04-15')),
    updatedAt: Timestamp.fromDate(new Date('2025-04-15')),
    published: true,
    tags: ['accommodation', 'student-life', 'budget-friendly'],
    readTime: 5
  },
  {
    id: 'sample-2',
    title: 'Top 10 Student-Friendly Areas in Bangalore',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    summary: 'Discover the best neighborhoods in Bangalore for students, with proximity to colleges, affordable living options, and vibrant social scenes.',
    slug: 'top-student-friendly-areas-bangalore',
    author: 'Priya Patel',
    authorId: 'author-2',
    publishedAt: Timestamp.fromDate(new Date('2025-04-10')),
    updatedAt: Timestamp.fromDate(new Date('2025-04-10')),
    published: true,
    tags: ['bangalore', 'neighborhoods', 'student-life'],
    readTime: 7
  },
  {
    id: 'sample-3',
    title: 'How to Negotiate PG Rent and Save Money',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    summary: 'Learn effective strategies to negotiate your PG rent and save money while still getting the amenities and location you need.',
    slug: 'negotiate-pg-rent-save-money',
    author: 'Vikram Singh',
    authorId: 'author-3',
    publishedAt: Timestamp.fromDate(new Date('2025-04-05')),
    updatedAt: Timestamp.fromDate(new Date('2025-04-05')),
    published: true,
    tags: ['budget-friendly', 'negotiation', 'saving-tips'],
    readTime: 6
  }
];

// Get all published blog posts
export const getPublishedBlogPosts = async (): Promise<BlogPost[]> => {
  try {
    const q = query(
      collection(db, 'blogPosts'),
      where('published', '==', true),
      orderBy('publishedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as BlogPost[];
  } catch (error) {
    console.error('Error getting published blog posts:', error);
    // Return sample blog posts if there's a permission error
    if (error instanceof Error && error.toString().includes('permission')) {
       ('Using sample blog posts due to permission error');
      return sampleBlogPosts;
    }
    throw error;
  }
};

// Get all blog posts (for admin)
export const getAllBlogPosts = async (): Promise<BlogPost[]> => {
  try {
    const q = query(
      collection(db, 'blogPosts'),
      orderBy('publishedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as BlogPost[];
  } catch (error) {
    console.error('Error getting all blog posts:', error);
    throw error;
  }
};

// Get a single blog post by ID
export const getBlogPostById = async (id: string): Promise<BlogPost | null> => {
  try {
    const blogRef = doc(db, 'blogPosts', id);
    const blogSnap = await getDoc(blogRef);
    
    if (blogSnap.exists()) {
      return {
        id: blogSnap.id,
        ...blogSnap.data()
      } as BlogPost;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting blog post by ID:', error);
    throw error;
  }
};

// Get a single blog post by slug
export const getBlogPostBySlug = async (slug: string): Promise<BlogPost | null> => {
  try {
    const q = query(
      collection(db, 'blogPosts'),
      where('slug', '==', slug),
      where('published', '==', true)
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      } as BlogPost;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting blog post by slug:', error);
    // Return sample blog post if there's a permission error
    if (error instanceof Error && error.toString().includes('permission')) {
       ('Using sample blog post due to permission error');
      const samplePost = sampleBlogPosts.find(post => post.slug === slug);
      return samplePost || null;
    }
    throw error;
  }
};

// Generate a slug from a title
export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/gi, '')
    .replace(/\s+/g, '-')
    .trim();
};

// Calculate read time based on content length (average reading speed: 200 words per minute)
export const calculateReadTime = (content: string): number => {
  const words = content.trim().split(/\s+/).length;
  const readTime = Math.ceil(words / 200);
  return readTime > 0 ? readTime : 1; // Minimum 1 minute read time
};
