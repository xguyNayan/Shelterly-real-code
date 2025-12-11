import { storage } from './config';
import { ref, uploadBytes, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { compressImage, batchCompressImages } from '../utils/imageOptimization';
import { compressVideo, generateVideoThumbnail, isVideoFile } from '../utils/videoOptimization';

/**
 * Uploads an image file to Firebase Storage
 * @param file The file to upload
 * @param path The storage path (e.g., 'pg-images')
 * @returns Promise with the download URL
 */
export const uploadImage = async (file: File, path: string = 'pg-images', options?: any): Promise<string> => {
  try {

    // Compress the image before uploading
    const compressedFile = await compressImage(file, options);
    
    // Create a unique filename to prevent overwriting
    const fileExtension = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const fullPath = `${path}/${fileName}`;
    
    
    // Create a reference to the file location in Firebase Storage
    const storageRef = ref(storage, fullPath);
    
    // Upload the compressed file
    const snapshot = await uploadBytes(storageRef, compressedFile);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    throw error;
  }
};

/**
 * Deletes an image from Firebase Storage
 * @param url The download URL of the image to delete
 * @returns Promise<void>
 */
export const deleteImage = async (url: string): Promise<void> => {
  try {
    // Extract the path from the URL
    // URLs from Firebase Storage typically look like:
    // https://firebasestorage.googleapis.com/v0/b/[bucket]/o/[path]?token=[token]
    const decodedUrl = decodeURIComponent(url);
    const startIndex = decodedUrl.indexOf('/o/') + 3;
    const endIndex = decodedUrl.indexOf('?');
    
    // Check if the URL is in the expected format
    if (startIndex < 3 || endIndex === -1) {
    
      return; // Exit early without throwing an error
    }
    
    const path = decodedUrl.substring(startIndex, endIndex);
    
    // Create a reference to the file
    const storageRef = ref(storage, path);
    
    // Delete the file
    await deleteObject(storageRef);
  } catch (error: any) {
    
    
    // Don't throw error if the file doesn't exist - this is not a critical failure
    if (error.code === 'storage/object-not-found') {
      
      return; // Exit without throwing
    }
    
    throw error;
  }
};

/**
 * Uploads multiple images to Firebase Storage
 * @param files Array of files to upload
 * @param path The storage path (e.g., 'pg-images')
 * @returns Promise with an array of download URLs
 */
export const uploadMultipleImages = async (files: File[], path: string = 'pg-images', options?: any): Promise<string[]> => {
  try {
    
    
    // Compress all images in batch before uploading
    const compressedFiles = await batchCompressImages(files, options);
    
    // Upload each compressed file
    const uploadPromises = compressedFiles.map(file => uploadImage(file, path, { skipCompression: true }));
    const results = await Promise.all(uploadPromises);
    
    
    return results;
  } catch (error) {
    
    throw error;
  }
};

/**
 * Uploads a video file to Firebase Storage with optimization
 * @param file The video file to upload
 * @param path The storage path (e.g., 'pg-videos')
 * @param options Compression options
 * @param onProgress Optional callback for upload progress
 * @returns Promise with the download URL and thumbnail URL
 */
// Import the VideoCompressionOptions type from videoOptimization
import { VideoCompressionOptions } from '../utils/videoOptimization';

// Default compression options
const defaultCompressionOptions: VideoCompressionOptions = {
  maxSizeMB: 50,
  maxWidth: 1280,
  bitrate: 1000000,
  quality: 0.8
};

export const uploadVideo = async (
  file: File, 
  path: string = 'pg-videos', 
  compressionOptions: VideoCompressionOptions = defaultCompressionOptions,
  onProgress?: (progress: number, stage: string) => void
): Promise<{ videoUrl: string; thumbnailUrl: string; duration: number }> => {
  // Check if Firebase Storage is properly initialized
  
  
  if (!storage) {
    throw new Error('Firebase Storage is not initialized');
  }
  try {
    // Validate file
    if (!file || !(file instanceof File)) {
      
      throw new Error('Invalid file object provided');
    }
    
    const fileSize = (file.size / 1024 / 1024).toFixed(2);
  
    // Update progress
    onProgress?.(10, 'Generating thumbnail');
    
    // Generate a thumbnail for the video
    const thumbnailDataUrl = await generateVideoThumbnail(file);
    
    // Convert data URL to File object
    const thumbnailFile = await dataURLtoFile(thumbnailDataUrl, `${file.name.split('.')[0]}-thumbnail.jpg`);
    
    // Update progress
    onProgress?.(20, 'Extracting duration');
    
    // Get video duration
    const duration = await getVideoDuration(file);
    
    // Update progress
    onProgress?.(30, 'Processing video');
    
    // Check if compression was skipped
    const wasCompressionSkipped = localStorage.getItem('compression_skipped') === 'true';
    
    // Optimize the video if needed
    const compressedFile = await compressVideo(file, compressionOptions);
    
    // Update progress
    onProgress?.(40, wasCompressionSkipped ? 'Preparing upload' : 'Optimization complete');
    
    // Create unique filenames to prevent overwriting
    const videoExtension = file.name.split('.').pop();
    const videoFileName = `${uuidv4()}.${videoExtension}`;
    const videoFullPath = `${path}/${videoFileName}`;
    
    // Create references to the file locations in Firebase Storage
    const videoStorageRef = ref(storage, videoFullPath);
    
    // Update progress
    onProgress?.(50, 'Uploading video');
    
    // Upload the video file with progress tracking
    
    // Create the upload task with better error handling
    let uploadTask;
    try {
      
      uploadTask = uploadBytesResumable(videoStorageRef, compressedFile);
    } catch (error) {
      
      throw new Error(`Failed to create upload task: ${error.message}`);
    }
    
    // Return a promise that resolves when the upload is complete
    const videoUploadPromise = new Promise<string>((resolve, reject) => {
      
      
      try {
        // Attach listeners directly without setTimeout
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            // Calculate progress percentage
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            // Map the upload progress to 50-90% of the total process
            const mappedProgress = 50 + (progress * 0.4);
            
            onProgress?.(Math.round(mappedProgress), 'Uploading video');
          },
          (error) => {
            
            
            reject(error);
          },
          async () => {
            // Upload completed successfully
            try {
              const videoDownloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(videoDownloadURL);
            } catch (urlError) {
              console.error('%c ERROR GETTING DOWNLOAD URL', 'background: #FF5722; color: white; font-weight: bold; padding: 4px;');
              console.error('Error details:', {
                errorMessage: urlError.message,
                errorName: urlError.name,
                errorStack: urlError.stack,
                timestamp: new Date().toISOString()
              });
              reject(urlError);
            }
          }
        );
      } catch (listenerError) {
        console.error('Error setting up upload listeners:', listenerError);
        reject(listenerError);
      }
    });
    
    // Wait for video upload to complete
    const videoDownloadURL = await videoUploadPromise;
    
    // Update progress
    onProgress?.(90, 'Uploading thumbnail');
    
    // Upload the thumbnail
    const thumbnailStorageRef = ref(storage, `${path}/thumbnails/${uuidv4()}.jpg`);
    await uploadBytes(thumbnailStorageRef, thumbnailFile);
    const thumbnailDownloadURL = await getDownloadURL(thumbnailStorageRef);
    
    // Clear the compression skipped flag
    localStorage.removeItem('compression_skipped');
    
    onProgress?.(100, 'Upload complete');
    
    // Return the complete object with all required properties
    return {
      videoUrl: videoDownloadURL,
      thumbnailUrl: thumbnailDownloadURL,
      duration
    };
  } catch (error) {
    console.error('Error uploading video:', error);
    throw error;
  }
};

/**
 * Uploads multiple videos to Firebase Storage
 * @param files Array of video files to upload
 * @param path The storage path (e.g., 'pg-videos')
 * @returns Promise with an array of video data objects
 */
export const uploadMultipleVideos = async (
  files: File[], 
  path: string = 'pg-videos', 
  options?: any
): Promise<Array<{ videoUrl: string; thumbnailUrl: string; duration: number }>> => {
  try {
    
    // Upload each video file
    const uploadPromises = files.map(file => uploadVideo(file, path, options));
    const results = await Promise.all(uploadPromises);
    
    return results;
  } catch (error) {
    console.error('Error uploading multiple videos:', error);
    throw error;
  }
};

/**
 * Converts a data URL to a File object
 * @param dataUrl The data URL
 * @param filename The filename to use
 * @returns File object
 */
const dataURLtoFile = async (dataUrl: string, filename: string): Promise<File> => {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type });
};

/**
 * Gets the duration of a video file
 * @param videoFile Video file
 * @returns Promise with duration in seconds
 */
const getVideoDuration = async (videoFile: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    // Create object URL for the video file
    const videoUrl = URL.createObjectURL(videoFile);
    video.src = videoUrl;
    
    // When video metadata is loaded
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(videoUrl);
      resolve(video.duration);
    };
    
    // Handle errors
    video.onerror = () => {
      URL.revokeObjectURL(videoUrl);
      reject(new Error('Error loading video'));
    };
    
    // Start loading the video
    video.load();
  });
};
