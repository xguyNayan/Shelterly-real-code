/**
 * Image optimization utilities for Shelterly
 * These functions help optimize images for better performance
 */
import imageCompression from 'browser-image-compression';

/**
 * Generates a WebP URL from a Firebase Storage URL if possible
 * @param url Original image URL
 * @returns WebP URL if possible, otherwise the original URL
 */
export const getOptimizedImageUrl = (url: string): string => {
  // Check if it's a Firebase Storage URL
  if (url && url.includes('firebasestorage.googleapis.com')) {
    // Add WebP conversion parameter to Firebase Storage URL
    // This works because Firebase Storage supports on-the-fly image transformations
    if (!url.includes('&format=webp')) {
      // Add WebP format parameter
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}format=webp&quality=85`;
    }
  }
  
  // Return original URL if it's not a Firebase Storage URL or already optimized
  return url;
};

/**
 * Generates a responsive image URL with appropriate size for the device
 * @param url Original image URL
 * @param width Desired width
 * @returns Resized image URL if possible, otherwise the original URL
 */
export const getResponsiveImageUrl = (url: string, width: number): string => {
  // Check if it's a Firebase Storage URL
  if (url && url.includes('firebasestorage.googleapis.com')) {
    // Add width parameter to Firebase Storage URL
    if (!url.includes('&width=') && !url.includes('?width=')) {
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}width=${width}&format=webp&quality=85`;
    }
  }
  
  // Return original URL if it's not a Firebase Storage URL or already has width parameter
  return url;
};

/**
 * Generates a responsive source set for different device sizes
 * @param url Original image URL
 * @returns Source set string for responsive images
 */
export const getResponsiveSourceSet = (url: string): string => {
  if (!url || !url.includes('firebasestorage.googleapis.com')) {
    return url;
  }
  
  // Generate source set for different device sizes
  const widths = [320, 480, 768, 1024, 1280];
  return widths
    .map(width => {
      const optimizedUrl = getResponsiveImageUrl(url, width);
      return `${optimizedUrl} ${width}w`;
    })
    .join(', ');
};

/**
 * Determines if an image should be lazy loaded based on its position
 * @param index Position of the image in a list
 * @returns Loading attribute value
 */
export const getLoadingAttribute = (index: number): "lazy" | "eager" => {
  // Load the first few images eagerly for better LCP
  return index < 3 ? "eager" : "lazy";
};

/**
 * Determines the fetchPriority attribute based on image importance
 * @param isPriority Whether the image is a priority image
 * @returns FetchPriority attribute value
 */
export const getFetchPriority = (isPriority: boolean): "high" | "auto" => {
  return isPriority ? "high" : "auto";
};

/**
 * Compresses an image file before uploading
 * @param imageFile Original image file
 * @param options Compression options
 * @returns Promise with compressed File object
 */
export const compressImage = async (imageFile: File, options?: any): Promise<File> => {
  try {
    // Default options for good quality/size balance
    const defaultOptions = {
      maxSizeMB: 1, // Max file size in MB
      maxWidthOrHeight: 1920, // Max width/height in pixels
      useWebWorker: true, // Use web worker for better UI performance
      initialQuality: 0.8, // Initial quality (0-1)
    };

    // Merge default options with provided options
    const compressionOptions = {
      ...defaultOptions,
      ...options,
    };

    // Skip compression for small images (less than 300KB)
    if (imageFile.size < 300 * 1024) {
      console.log('Image is already small, skipping compression');
      return imageFile;
    }

    // Compress the image
    const compressedFile = await imageCompression(imageFile, compressionOptions);
    
    // Calculate compression stats
    const originalSize = (imageFile.size / 1024 / 1024).toFixed(2);
    const compressedSize = (compressedFile.size / 1024 / 1024).toFixed(2);
    const compressionRatio = (compressedFile.size / imageFile.size * 100).toFixed(2);
    
    console.log('Original image size:', originalSize, 'MB');
    console.log('Compressed image size:', compressedSize, 'MB');
    console.log('Compression ratio:', compressionRatio, '%');
    
    // Store stats in localStorage for the UI to access
    localStorage.setItem('last_compressed_size', compressedSize);
    localStorage.setItem('last_compression_ratio', compressionRatio);
    
    return compressedFile;
  } catch (error) {
    console.error('Error compressing image:', error);
    // Return original file if compression fails
    return imageFile;
  }
};

/**
 * Batch processes multiple images for optimization
 * @param imageFiles Array of image files
 * @param options Compression options
 * @returns Promise with array of compressed File objects
 */
export const batchCompressImages = async (imageFiles: File[], options?: any): Promise<File[]> => {
  try {
    const compressionPromises = imageFiles.map(file => compressImage(file, options));
    return await Promise.all(compressionPromises);
  } catch (error) {
    console.error('Error in batch image compression:', error);
    return imageFiles; // Return original files if batch compression fails
  }
};
