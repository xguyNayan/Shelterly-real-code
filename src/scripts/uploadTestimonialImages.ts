import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/config';
import * as fs from 'fs';
import * as path from 'path';

// Function to upload a file to Firebase Storage
const uploadImageToStorage = async (filePath: string, fileName: string): Promise<string> => {
  try {
    // Read file
    const fileBuffer = fs.readFileSync(filePath);
    
    // Create file metadata including the content type
    const metadata = {
      contentType: 'image/jpeg',
    };
    
    // Upload file and metadata
    const storageRef = ref(storage, 'testimonials/' + fileName);
    const uploadTask = await uploadBytes(storageRef, fileBuffer, metadata);
    
    // Get download URL
    const downloadURL = await getDownloadURL(uploadTask.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// Main function to upload all images
const uploadAllImages = async () => {
  const imagesDir = path.join(__dirname, '..', 'assets', 'images');
  const files = fs.readdirSync(imagesDir);
  
  const imageUrls: Record<string, string> = {};
  
  for (const file of files) {
    // Skip logo.png
    if (file === 'logo.png') {
       ('Skipping logo.png');
      continue;
    }
    
    const filePath = path.join(imagesDir, file);
    
    // Check if it's a file
    if (fs.statSync(filePath).isFile()) {
      const downloadURL = await uploadImageToStorage(filePath, file);
      imageUrls[file] = downloadURL;
    }
  }
  
  // Save URLs to a JSON file for reference
  fs.writeFileSync(
    path.join(__dirname, 'testimonialImageUrls.json'),
    JSON.stringify(imageUrls, null, 2)
  );
  
   ('All images uploaded successfully!');
   ('URLs saved to testimonialImageUrls.json');
  
  return imageUrls;
};

// Run the upload function
uploadAllImages().catch(console.error);
