import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define paths
const inputPath = join(__dirname, 'src/assets/images/hero.png');
const outputPath = join(__dirname, 'src/assets/images/hero.webp');
const outputPathSmall = join(__dirname, 'src/assets/images/hero-small.webp');

async function optimizeImage() {
  try {
    // Get image metadata
    const metadata = await sharp(inputPath).metadata();
     ('Original image metadata:', metadata);
    
    // Create WebP version with 80% quality (good balance between quality and file size)
    await sharp(inputPath)
      .webp({ quality: 80 })
      .toFile(outputPath);
    
    // Create a smaller version for mobile
    await sharp(inputPath)
      .resize({ width: Math.floor(metadata.width * 0.6) }) // 60% of original width
      .webp({ quality: 75 })
      .toFile(outputPathSmall);
    
    // Log file sizes for comparison
    const originalSize = fs.statSync(inputPath).size;
    const webpSize = fs.statSync(outputPath).size;
    const smallSize = fs.statSync(outputPathSmall).size;
    
     (`Original size: ${(originalSize / 1024).toFixed(2)} KB`);
     (`WebP size: ${(webpSize / 1024).toFixed(2)} KB`);
     (`Small WebP size: ${(smallSize / 1024).toFixed(2)} KB`);
     (`Size reduction: ${(100 - (webpSize / originalSize * 100)).toFixed(2)}%`);
    
     ('Image optimization completed successfully!');
  } catch (error) {
    console.error('Error optimizing image:', error);
  }
}

optimizeImage();
