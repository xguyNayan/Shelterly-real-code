import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiX, FiCheck, FiTrash2, FiArrowLeft, FiArrowRight, FiLoader, FiMapPin
} from 'react-icons/fi';
import { getCoordinatesFromLocationName } from '../../utils/geocoding';
import { uploadImage, deleteImage, uploadVideo } from '../../firebase/storageService';
import { generateVideoThumbnail, getVideoDuration, isVideoFile } from '../../utils/videoOptimization';

// Photo Category Type
type PhotoCategory = 'bedroom-single' | 'bedroom-double' | 'bedroom-triple' | 'bedroom-four' | 'bedroom-five' | 'bedroom' | 'bathroom' | 'kitchen' | 'common' | 'exterior' | 'other';

// Media Category Type (for both photos and videos)
type MediaCategory = PhotoCategory | 'room-tour' | 'property-tour' | 'amenities' | 'neighborhood';

// Photo Interface
interface PhotoData {
  url: string;
  category: PhotoCategory;
  caption?: string;
}

// Video Interface
interface VideoData {
  videoUrl: string;
  thumbnailUrl: string;
  category: MediaCategory;
  caption?: string;
  duration: number; // in seconds
}

// PG Onboarding Interface
export interface PGData {
  id?: string; // Firestore document ID
  // Basic Information
  name: string;
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
  gender: 'male' | 'female' | 'unisex';
  branch: string;
  address: string;
  location: string;
  coordinates?: { lat: number; lng: number };
  status: 'initial' | 'verification' | 'listing' | 'active';
  isVerified?: boolean;
  rating?: number;
  reviews?: number;
  discount?: number;
  
  // Capacity and Pricing
  beds: number;
  food: boolean;
  foodType?: 'veg' | 'non-veg' | 'both' | '';
  deposit: string; // Now represents months of rent (e.g., '1 month', '2 months')
  noticePeriod?: number; // Notice period in months
  preferredTenants?: string; // E.g., "Students & Working Professionals"
  
  // Additional Charges
  electricityCharges?: string; // Description of electricity charges
  securityDeposit?: string; // Custom security deposit amount or description
  additionalCharges?: Array<{
    name: string;
    amount?: number | string;
    displayText?: string;
    description?: string;
    required?: boolean;
  }>; // Other additional charges
  
  // Room Types and Pricing
  singleRoomPrice?: number; // Single room price
  doubleRoomPrice?: number; // Double sharing price
  tripleRoomPrice?: number; // Triple sharing price
  oneSharing: { available: boolean; price?: number };
  twoSharing: { available: boolean; price?: number };
  threeSharing: { available: boolean; price?: number };
  fourSharing: { available: boolean; price?: number };
  fiveSharing: { available: boolean; price?: number };
  
  // Amenities
  lockIn: number; // Lock-in period in months
  washroom: 'attached' | 'common' | 'both';
  fridge: boolean;
  wifi: boolean;
  washingMachine: boolean;
  housekeeping: boolean;
  parking: boolean;
  security: boolean;
  tv: boolean;
  ac?: boolean; // Air conditioning
  powerBackup?: boolean;
  lift?: boolean; // Elevator/Lift
  meals?: { breakfast: boolean; lunch: boolean; dinner: boolean };
  furnishing?: 'fully' | 'semi' | 'unfurnished';
  geyser?: boolean; // Hot water
  cctv?: boolean; // CCTV surveillance
  
  // Nearby Places
  nearestBusStop: string;
  nearestAirport: string;
  nearestRailwayStation: string;
  nearestMetroStation: string;
  nearestCollege: string;
  nearestPharmacy: string;
  nearestSupermarket: string;
  distanceFromCollege?: number; // Distance in km
  
  // Neighborhood and Commute Information
  neighborhoodDescription?: string;
  neighborhoodHighlight?: string;
  commute?: string;
  nearbyPlaces?: Array<{ type: string; name: string; distance: string; time: string }>;
  transportation?: string[] | string;
  essentialServices?: string[] | string;
  
  // Additional Information
  description?: string; // About this PG
  rules?: string[];
  highlights?: string[];
  
  // Media
  photos: PhotoData[];
  videos: VideoData[];
  videoTourUrl?: string; // Legacy field for backward compatibility
  virtualTourLink?: string;
}

interface PGOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PGData) => void;
  editData?: PGData | null; // Optional PG data for editing
}

const PGOnboardingModal: React.FC<PGOnboardingModalProps> = ({ isOpen, onClose, onSubmit, editData }) => {
  // Draft saving functionality
  const DRAFT_STORAGE_KEY = 'pg_onboarding_draft';
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  
  // State for photo uploads
  const [tempPhotoUrl, setTempPhotoUrl] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<PhotoCategory>('bedroom');
  const [photoCaption, setPhotoCaption] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [optimizingImage, setOptimizingImage] = useState<boolean>(false);
  const [optimizationStats, setOptimizationStats] = useState<{original: string; compressed: string; ratio: string} | null>(null);
  
  // State for video uploads
  const [tempVideoUrl, setTempVideoUrl] = useState<string>('');
  const [tempVideoThumbnailUrl, setTempVideoThumbnailUrl] = useState<string>('');
  const [selectedVideoCategory, setSelectedVideoCategory] = useState<MediaCategory>('room-tour');
  const [videoCaption, setVideoCaption] = useState<string>('');
  const [uploadingVideo, setUploadingVideo] = useState<boolean>(false);
  const [videoUploadError, setVideoUploadError] = useState<string | null>(null);
  const [optimizingVideo, setOptimizingVideo] = useState<boolean>(false);
  const [videoOptimizationStats, setVideoOptimizationStats] = useState<{original: string; compressed: string; ratio: string} | null>(null);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [isVideoFile, setIsVideoFile] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<{percent: number; stage: string}>({percent: 0, stage: ''});
  
  // Load draft from localStorage if available
  const loadDraftFromStorage = (): PGData | null => {
    try {
      const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (savedDraft) {
        return JSON.parse(savedDraft);
      }
    } catch (error) {
      console.error('❌ Error loading draft:', error);
    }
    return null;
  };

  // Save current form data as draft
  const saveDraftToStorage = (data: PGData) => {
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('❌ Error saving draft:', error);
    }
  };

  // Clear saved draft
  const clearDraft = () => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
       ('🗑️ Draft cleared successfully');
    } catch (error) {
      console.error('❌ Error clearing draft:', error);
    }
  };

  // Default form data
  const defaultPgData: PGData = {
    // Basic Information
    name: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    gender: 'unisex',
    branch: '',
    address: '',
    location: '',
    status: 'initial',
    isVerified: false,
    rating: 4.5,
    reviews: 0,
    discount: 0,
    
    // Capacity and Pricing
    beds: 0,
    food: false,
    foodType: '',
    deposit: '1 month', // Default 1 month rent as deposit
    noticePeriod: 1, // Default 1 month notice period
    preferredTenants: 'Students & Working Professionals',
    
    // Room Types and Pricing
    singleRoomPrice: 0,
    doubleRoomPrice: 0,
    tripleRoomPrice: 0,
    oneSharing: { available: false, price: 0 },
    twoSharing: { available: false, price: 0 },
    threeSharing: { available: false, price: 0 },
    fourSharing: { available: false, price: 0 },
    fiveSharing: { available: false, price: 0 },
    
    // Amenities
    lockIn: 0, // Minimum stay duration in months
    washroom: 'common',
    fridge: false,
    wifi: false,
    washingMachine: false,
    housekeeping: false,
    parking: false,
    security: false,
    tv: false,
    ac: false,
    powerBackup: false,
    lift: false,
    meals: { breakfast: false, lunch: false, dinner: false },
    furnishing: 'fully',
    geyser: false,
    cctv: false,
    
    // Additional Charges
    electricityCharges: 'Based on actual consumption, charged separately',
    securityDeposit: '',
    additionalCharges: [],
    
    // Nearby Places
    nearestBusStop: '',
    nearestAirport: '',
    nearestRailwayStation: '',
    nearestMetroStation: '',
    nearestCollege: '',
    nearestPharmacy: '',
    nearestSupermarket: '',
    distanceFromCollege: 0,
    
    // Additional Information
    description: 'This is a comfortable PG accommodation with all the necessary amenities for a pleasant stay.',
    rules: [],
    highlights: ['24/7 Security & Surveillance', 'High-Speed WiFi Connectivity', 'Fully Furnished Rooms'],
    
    // Media
    photos: [],
    videos: [], // Initialize empty videos array
    videoTourUrl: ''
  };
  
  // Form data state - initialize with editData if provided
  const [showCustomDeposit, setShowCustomDeposit] = useState<boolean>(false);
  const [customDepositAmount, setCustomDepositAmount] = useState<string>('');
  
  const [pgData, setPgData] = useState<PGData>(editData || loadDraftFromStorage() || defaultPgData);
  const [isGeocodingLocation, setIsGeocodingLocation] = useState<boolean>(false);
  
  // Update form data when editData changes
  useEffect(() => {
    if (editData) {
      setPgData(editData);
      saveDraftToStorage(editData);
      // Check if deposit is a custom value
      if (editData.deposit && !['1 month', '2 months', '3 months', '6 months', 'custom'].includes(editData.deposit)) {
        setShowCustomDeposit(true);
        // Extract numeric value from deposit string (e.g., "₹5000" -> "5000")
        const numericValue = editData.deposit.replace(/[^0-9]/g, '');
        setCustomDepositAmount(numericValue);
      }
    }
  }, [editData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      const updatedData = {
        ...pgData,
        [name]: target.checked
      };
      setPgData(updatedData);
      saveDraftToStorage(updatedData);
    } else {
      // Special handling for deposit field
      if (name === 'deposit' && value === 'custom') {
        setShowCustomDeposit(true);
      } else if (name === 'deposit') {
        setShowCustomDeposit(false);
      }
      
      const updatedData = {
        ...pgData,
        [name]: value
      };
      setPgData(updatedData);
      saveDraftToStorage(updatedData);
    }
  };

  const handleCustomDepositChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomDepositAmount(value);
    const updatedData = {
      ...pgData,
      deposit: 'custom' // Keep the dropdown value as 'custom'
    };
    setPgData(updatedData);
    saveDraftToStorage(updatedData);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        
        
        // Check if the file is a video or an image
        const isVideo = file.type.startsWith('video/');
       
        setIsVideoFile(isVideo); // Set this first to ensure correct state for later operations
        
        if (isVideo) {
          // Handle video file
          setUploadingVideo(false); // Start with this false, will be set to true during actual upload
          setVideoUploadError(null);
          setOptimizingVideo(false);
          setVideoOptimizationStats(null);
          
          // Create a temporary URL for video preview
          const videoPreviewUrl = URL.createObjectURL(file);
          
          setTempVideoUrl(videoPreviewUrl);
          
          // Reset photo-related states to ensure they don't interfere
          setTempPhotoUrl('');
          setOptimizationStats(null);
          
          // Generate thumbnail from the video
          try {
            
            const thumbnailUrl = await generateVideoThumbnail(file);
            
            setTempVideoThumbnailUrl(thumbnailUrl);
          } catch (thumbnailError) {
            
            // Continue without thumbnail - the UI will fall back to showing the video itself
          }
          
          // Get video duration
          try {
            
            const duration = await getVideoDuration(file);
            
            setVideoDuration(duration);
          } catch (durationError) {
            setVideoDuration(0);
          }
          
          
        } else {
          // Handle image file
          setUploadingImage(false); // Start with this false
          setUploadError(null);
          setOptimizingImage(false);
          setOptimizationStats(null);
          
          // Reset video-related states
          setTempVideoUrl('');
          setTempVideoThumbnailUrl('');
          setVideoDuration(0);
          setVideoOptimizationStats(null);
          
          // Create a temporary URL for image preview
          const imagePreviewUrl = URL.createObjectURL(file);
         
          setTempPhotoUrl(imagePreviewUrl);
        }
        
        // The actual upload to Firebase Storage happens when the user clicks "Add to Gallery"
      } catch (error) {
       
        
        // Check if isVideoFile is already set, otherwise determine from file type
        const isVideoFile = file.type.startsWith('video/');
        
        if (isVideoFile) {
          setVideoUploadError(`Failed to process video: ${error.message || 'Unknown error'}. Please try again.`);
          setUploadingVideo(false);
          // Clean up any partial state
          setTempVideoUrl('');
          setTempVideoThumbnailUrl('');
        } else {
          setUploadError(`Failed to process image: ${error.message || 'Unknown error'}. Please try again.`);
          setUploadingImage(false);
          // Clean up any partial state
          setTempPhotoUrl('');
        }
      }
    }
  };
  
  // Add media (photo or video) to the PG data
  const handleAddPhoto = async () => {
    // Get the file from the input element
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = fileInput?.files?.[0];
    
    if (!file) {
      
      return;
    }
    
    // Check if the file is a video or an image
    const isVideo = file.type.startsWith('video/');
   
    
    if (isVideo && tempVideoUrl) {
      try {
        setUploadingVideo(true);
        setVideoUploadError(null);
        setOptimizingVideo(true);
        
        // Track original size for stats
        const originalSize = (file.size / 1024 / 1024).toFixed(2);
        
        // Reset upload progress
        setUploadProgress({percent: 0, stage: 'Starting'});
        
        // Upload to Firebase Storage with progress tracking
        const pgId = pgData.id || 'new-pg'; // Use PG ID if available, otherwise use a placeholder
        const uploadPath = `pg-videos/${pgId}/${selectedVideoCategory}`;
        
        
        const { videoUrl, thumbnailUrl, duration } = await uploadVideo(
          file, 
          uploadPath, 
          {
            // Custom options for this specific upload
            maxSizeMB: 50,
            maxWidth: 1280,
            bitrate: 1000000,
            quality: 0.8
          },
          // Progress callback with improved error handling
          (progress, stage) => {
          
            // Force state update with setTimeout to ensure React catches the change
            setTimeout(() => {
              setUploadProgress({percent: progress, stage});
              // Update UI based on progress
              if (progress < 40) {
                setOptimizingVideo(true);
              } else {
                setOptimizingVideo(false);
              }
            }, 0);
          }
        );
        
       
        
        // Get compression stats from localStorage
        const compressedSize = localStorage.getItem('last_video_size') || 'unknown';
        const estimatedCompressedSize = localStorage.getItem('estimated_compressed_size');
        
        // Update optimization stats for UI
        setVideoOptimizationStats({
          original: `${originalSize} MB`,
          compressed: estimatedCompressedSize ? `~${estimatedCompressedSize} MB` : 
                     (compressedSize !== 'unknown' ? `${compressedSize} MB` : 'optimized'),
          ratio: localStorage.getItem('compression_skipped') === 'true' ? 
                'direct upload (fast)' : 'optimized for streaming'
        });
        
        // Update PG data with the new video
        const updatedData = {
          ...pgData,
          videos: [...(pgData.videos || []), {
            videoUrl,
            thumbnailUrl,
            category: selectedVideoCategory,
            caption: videoCaption || undefined,
            duration
          }]
        };
        setPgData(updatedData);
        saveDraftToStorage(updatedData);
        
        // Reset form state
        setTempVideoUrl('');
        setTempVideoThumbnailUrl('');
        setVideoCaption('');
        setVideoDuration(0);
        setIsVideoFile(false);
        setVideoOptimizationStats(null);
        
        // Reset file input
        if (fileInput) {
          fileInput.value = '';
        }
        
      } catch (error) {
        console.error('Error uploading video:', error);
        setVideoUploadError(`Failed to upload video: ${error.message || 'Unknown error'}. Please try again.`);
     
      } finally {
        setUploadingVideo(false);
        setOptimizingVideo(false);
      }
    } else if (tempPhotoUrl) {
      // Handle image upload
      try {
        setUploadingImage(true);
        setUploadError(null);
        setOptimizingImage(true);
        
        // Get the file from the input element
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        const file = fileInput?.files?.[0];
        
        if (!file) {
          throw new Error('No file selected');
        }
        
        // Track original size for stats
        const originalSize = (file.size / 1024 / 1024).toFixed(2);
        
        // Upload to Firebase Storage (compression happens in uploadImage)
        const pgId = pgData.id || 'new-pg'; // Use PG ID if available, otherwise use a placeholder
        const storageUrl = await uploadImage(file, `pg-images/${pgId}/${selectedCategory}`, {
          // Custom options for this specific upload
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          initialQuality: 0.8,
          onProgress: (progress: number) => {
            // You could use this to show a progress bar
          }
        });
        
        // Get the compressed file size from localStorage if available
        // This is a workaround since we can't directly get the size after upload
        const compressedSize = localStorage.getItem('last_compressed_size') || 'unknown';
        const compressionRatio = localStorage.getItem('last_compression_ratio') || 'unknown';
        
        setOptimizationStats({
          original: `${originalSize} MB`,
          compressed: compressedSize !== 'unknown' ? `${compressedSize} MB` : 'optimized',
          ratio: compressionRatio !== 'unknown' ? `${compressionRatio}%` : 'improved'
        });
        
        // Add the photo to PG data with the Firebase Storage URL
        const updatedData = {
          ...pgData,
          photos: [...pgData.photos, {
            url: storageUrl, // Use the Firebase Storage URL
            category: selectedCategory,
            caption: photoCaption || undefined
          }]
        };
        setPgData(updatedData);
        saveDraftToStorage(updatedData);
        
        // Reset the form
        setTempPhotoUrl('');
        setPhotoCaption('');
      } catch (error) {
        console.error('Error uploading image:', error);
        setUploadError('Failed to upload image. Please try again.');
      } finally {
        setUploadingImage(false);
        setOptimizingImage(false);
      }
    }
  };
  
  // Format video duration from seconds to MM:SS format
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Function to remove a video from the PG data
  const handleRemoveVideo = (index: number) => {
    const updatedVideos = [...pgData.videos];
    updatedVideos.splice(index, 1);
    const updatedData = {
      ...pgData,
      videos: updatedVideos
    };
    setPgData(updatedData);
    saveDraftToStorage(updatedData);
  };

  // Remove photo from the PG data
  const handleRemovePhoto = async (index: number) => {
    try {
      const photoToRemove = pgData.photos[index];
      
      // Delete from Firebase Storage if it's a Firebase URL
      if (photoToRemove.url.includes('firebasestorage.googleapis.com')) {
        await deleteImage(photoToRemove.url);
      }
      
      // Remove from PG data
      const updatedData = {
        ...pgData,
        photos: pgData.photos.filter((_, i) => i !== index)
      };
      setPgData(updatedData);
      saveDraftToStorage(updatedData);
    } catch (error) {
      console.error('Error removing photo:', error);
     
    }
  };
  
  const handleRoomTypeChange = (type: 'oneSharing' | 'twoSharing' | 'threeSharing' | 'fourSharing' | 'fiveSharing', field: 'available' | 'price', value: boolean | number) => {
    const updatedData = {
      ...pgData,
      [type]: {
        ...pgData[type],
        [field]: value
      }
    };
    setPgData(updatedData);
    saveDraftToStorage(updatedData);
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };
  
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };
  
  const handleSubmit = async () => {
    let finalPgData = {...pgData};
    
    // If custom deposit is selected, update the deposit value with the actual amount
    if (showCustomDeposit && customDepositAmount) {
      finalPgData = {
        ...finalPgData,
        deposit: `₹${customDepositAmount}`
      };
    }
    
    // If location is provided but coordinates are missing, try to geocode it
    if (finalPgData.location && !finalPgData.coordinates) {
      try {
        setIsGeocodingLocation(true);
        const coordinates = await getCoordinatesFromLocationName(finalPgData.location);
        finalPgData = {
          ...finalPgData,
          coordinates
        };
      } catch (error) {
        console.error('Error geocoding location during submission:', error);
        // Continue with submission even if geocoding fails
      } finally {
        setIsGeocodingLocation(false);
      }
    }
    
     (finalPgData);
    onSubmit(finalPgData);
    clearDraft(); // Clear draft after successful submission
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-800">Add New PG</h3>
          <button 
            onClick={() => {
              // Save draft before closing
               ('🚪 Modal closing, saving draft...');
              saveDraftToStorage(pgData);
              onClose();
            }}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <FiX size={20} />
          </button>
        </div>
        
        {/* Progress Bar */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <React.Fragment key={index}>
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep > index + 1 
                      ? 'bg-primary-500 text-white' 
                      : currentStep === index + 1 
                        ? 'bg-primary-500 text-white' 
                        : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {currentStep > index + 1 ? <FiCheck size={16} /> : index + 1}
                </div>
                {index < totalSteps - 1 && (
                  <div 
                    className={`flex-1 h-1 mx-2 ${
                      currentStep > index + 1 ? 'bg-primary-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Basic Info</span>
            <span>Capacity & Pricing</span>
            <span>Amenities</span>
            <span>Nearby Places</span>
            <span>Photos & Review</span>
          </div>
        </div>
        
        {/* Form Content - Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-800 mb-4">Basic Information</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      PG Name*
                    </label>
                    <input 
                      type="text" 
                      name="name"
                      value={pgData.name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter PG name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Branch
                    </label>
                    <input 
                      type="text" 
                      name="branch"
                      value={pgData.branch}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter branch name (if applicable)"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Person*
                    </label>
                    <input 
                      type="text" 
                      name="contactName"
                      value={pgData.contactName}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter contact person name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Phone*
                    </label>
                    <input 
                      type="tel" 
                      name="contactPhone"
                      value={pgData.contactPhone}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter contact phone number"
                      required
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender*
                  </label>
                  <div className="flex space-x-4">
                    <label className="inline-flex items-center">
                      <input 
                        type="radio" 
                        name="gender"
                        value="male"
                        checked={pgData.gender === 'male'}
                        onChange={() => setPgData(prev => ({ ...prev, gender: 'male' }))}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">Male</span>
                    </label>
                    
                    <label className="inline-flex items-center">
                      <input 
                        type="radio" 
                        name="gender"
                        value="female"
                        checked={pgData.gender === 'female'}
                        onChange={() => setPgData(prev => ({ ...prev, gender: 'female' }))}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">Female</span>
                    </label>
                    
                    <label className="inline-flex items-center">
                      <input 
                        type="radio" 
                        name="gender"
                        value="unisex"
                        checked={pgData.gender === 'unisex'}
                        onChange={() => setPgData(prev => ({ ...prev, gender: 'unisex' }))}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">Unisex</span>
                    </label>
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address*
                  </label>
                  <textarea 
                    name="address"
                    value={pgData.address}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter complete address"
                    required
                  />
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location/Area*
                  </label>
                  <div className="relative">
                    <input 
                      type="text" 
                      name="location"
                      value={pgData.location}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter location or area name"
                      required
                    />
                    <button 
                      type="button"
                      onClick={async () => {
                        if (!pgData.location) return;
                        setIsGeocodingLocation(true);
                        try {
                          const coordinates = await getCoordinatesFromLocationName(pgData.location);
                          setPgData(prev => ({
                            ...prev,
                            coordinates
                          }));
                         
                        } catch (error) {
                          console.error('Error geocoding location:', error);
                         
                        } finally {
                          setIsGeocodingLocation(false);
                        }
                      }}
                      disabled={!pgData.location || isGeocodingLocation}
                      className="absolute right-2 top-2 text-primary-600 hover:text-primary-800 disabled:text-gray-400"
                      title="Get coordinates from location"
                    >
                      {isGeocodingLocation ? <FiLoader className="animate-spin" /> : <FiMapPin />}
                    </button>
                  </div>
                  {pgData.coordinates && (
                    <p className="mt-1 text-xs text-green-600">
                      Coordinates: {pgData.coordinates.lat.toFixed(6)}, {pgData.coordinates.lng.toFixed(6)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Step 2: Capacity & Pricing */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-800 mb-4">Capacity & Pricing</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Beds*
                    </label>
                    <input 
                      type="number" 
                      name="beds"
                      value={pgData.beds}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Total number of beds"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Security Deposit*
                    </label>
                    <select
                      name="deposit"
                      value={pgData.deposit}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      required
                    >
                      <option value="1 month">1 Month Rent</option>
                      <option value="2 months">2 Months Rent</option>
                      <option value="3 months">3 Months Rent</option>
                      <option value="6 months">6 Months Rent</option>
                      <option value="custom">Custom Amount</option>
                    </select>
                    
                    {showCustomDeposit && (
                      <div className="mt-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Custom Deposit Amount (₹)*
                        </label>
                        <input
                          type="number"
                          value={customDepositAmount}
                          onChange={handleCustomDepositChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                          placeholder="Enter amount in rupees"
                          required={showCustomDeposit}
                        />
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Stay Duration (Lock-in Period in months)
                    </label>
                    <input 
                      type="number" 
                      name="lockIn"
                      value={pgData.lockIn || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="E.g., 3"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Electricity Charges
                    </label>
                    <input 
                      type="text" 
                      name="electricityCharges"
                      value={pgData.electricityCharges || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="E.g., Based on actual consumption"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Additional Charges
                    </label>
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-sm text-gray-500 font-medium">Charge name</div>
                        <div className="text-sm text-gray-500 font-medium">Amount</div>
                        <div className="text-sm text-gray-500 font-medium">Description</div>
                      </div>
                      
                      {pgData.additionalCharges?.map((charge, index) => (
                        <div key={index} className="grid grid-cols-3 gap-4 items-center relative">
                          <input
                            type="text"
                            value={charge.name}
                            onChange={(e) => {
                              const updatedCharges = [...(pgData.additionalCharges || [])];
                              updatedCharges[index] = { ...updatedCharges[index], name: e.target.value };
                              setPgData({ ...pgData, additionalCharges: updatedCharges });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                            placeholder="Charge name"
                          />
                          <input
                            type="text"
                            value={charge.amount || ''}
                            onChange={(e) => {
                              const updatedCharges = [...(pgData.additionalCharges || [])];
                              updatedCharges[index] = { ...updatedCharges[index], amount: e.target.value };
                              setPgData({ ...pgData, additionalCharges: updatedCharges });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                            placeholder="Amount"
                          />
                          <div className="relative">
                            <input
                              type="text"
                              value={charge.description || ''}
                              onChange={(e) => {
                                const updatedCharges = [...(pgData.additionalCharges || [])];
                                updatedCharges[index] = { ...updatedCharges[index], description: e.target.value };
                                setPgData({ ...pgData, additionalCharges: updatedCharges });
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                              placeholder="Description"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const updatedCharges = [...(pgData.additionalCharges || [])];
                                updatedCharges.splice(index, 1);
                                setPgData({ ...pgData, additionalCharges: updatedCharges });
                              }}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-red-600 hover:text-red-800"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                      
                      <div className="flex items-center space-x-4 mt-4">
                        <button
                          type="button"
                          onClick={() => {
                            const newCharge = { name: '', amount: '', description: '', required: false };
                            setPgData({
                              ...pgData,
                              additionalCharges: [...(pgData.additionalCharges || []), newCharge]
                            });
                          }}
                          className="inline-flex items-center px-3 py-2 border border-primary-500 text-sm font-medium rounded-md text-primary-600 bg-white hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                          <span className="mr-1">+</span>
                          Add Charge
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => {
                            // Initialize with common additional charges
                            const commonCharges = [
                              { 
                                name: 'Maintenance', 
                                amount: '500', 
                                description: 'Monthly maintenance fee for common areas and facilities',
                                required: true 
                              },
                              { 
                                name: 'Laundry', 
                                amount: 'As per usage', 
                                description: 'Pay per use of washing machine and dryer',
                                required: false 
                              }
                            ];
                            
                            setPgData({
                              ...pgData,
                              additionalCharges: [...commonCharges]
                            });
                          }}
                          className="inline-flex items-center px-3 py-2 border border-blue-500 text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Add Common Charges
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <label className="flex items-center">
                        <input 
                          type="checkbox" 
                          name="food"
                          checked={pgData.food}
                          onChange={handleChange}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Food Included in Rent</span>
                      </label>
                    </div>
                    
                    {pgData.food && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Food Type
                        </label>
                        <select
                          name="foodType"
                          value={pgData.foodType}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        >
                          <option value="">Select food type</option>
                          <option value="veg">Vegetarian Only</option>
                          <option value="non-veg">Non-Vegetarian Only</option>
                          <option value="both">Both Veg & Non-Veg Options</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-800 mb-4">Room Types & Pricing</h4>
                <p className="text-sm text-gray-500 mb-4">Select available room types and their monthly rent</p>
                
                <div className="space-y-4">
                  {/* One Sharing */}
                  <div className="flex flex-col md:flex-row md:items-center md:space-x-4 p-3 border border-gray-200 rounded-md bg-white">
                    <div className="flex items-center mb-2 md:mb-0 md:w-1/3">
                      <input 
                        type="checkbox" 
                        id="oneSharing"
                        checked={pgData.oneSharing.available}
                        onChange={(e) => handleRoomTypeChange('oneSharing', 'available', e.target.checked)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor="oneSharing" className="ml-2 text-sm font-medium text-gray-700">
                        One Sharing (Single)
                      </label>
                    </div>
                    
                    {pgData.oneSharing.available && (
                      <div className="md:w-2/3">
                        <label className="block text-xs text-gray-500 mb-1">Monthly Rent (₹)</label>
                        <input 
                          type="number" 
                          value={pgData.oneSharing.price || ''}
                          onChange={(e) => handleRoomTypeChange('oneSharing', 'price', parseInt(e.target.value) || 0)}
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                          placeholder="Amount in rupees"
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Two Sharing */}
                  <div className="flex flex-col md:flex-row md:items-center md:space-x-4 p-3 border border-gray-200 rounded-md bg-white">
                    <div className="flex items-center mb-2 md:mb-0 md:w-1/3">
                      <input 
                        type="checkbox" 
                        id="twoSharing"
                        checked={pgData.twoSharing.available}
                        onChange={(e) => handleRoomTypeChange('twoSharing', 'available', e.target.checked)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor="twoSharing" className="ml-2 text-sm font-medium text-gray-700">
                        Two Sharing (Double)
                      </label>
                    </div>
                    
                    {pgData.twoSharing.available && (
                      <div className="md:w-2/3">
                        <label className="block text-xs text-gray-500 mb-1">Monthly Rent (₹)</label>
                        <input 
                          type="number" 
                          value={pgData.twoSharing.price || ''}
                          onChange={(e) => handleRoomTypeChange('twoSharing', 'price', parseInt(e.target.value) || 0)}
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                          placeholder="Amount in rupees"
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Three Sharing */}
                  <div className="flex flex-col md:flex-row md:items-center md:space-x-4 p-3 border border-gray-200 rounded-md bg-white">
                    <div className="flex items-center mb-2 md:mb-0 md:w-1/3">
                      <input 
                        type="checkbox" 
                        id="threeSharing"
                        checked={pgData.threeSharing.available}
                        onChange={(e) => handleRoomTypeChange('threeSharing', 'available', e.target.checked)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor="threeSharing" className="ml-2 text-sm font-medium text-gray-700">
                        Three Sharing (Triple)
                      </label>
                    </div>
                    
                    {pgData.threeSharing.available && (
                      <div className="md:w-2/3">
                        <label className="block text-xs text-gray-500 mb-1">Monthly Rent (₹)</label>
                        <input 
                          type="number" 
                          value={pgData.threeSharing.price || ''}
                          onChange={(e) => handleRoomTypeChange('threeSharing', 'price', parseInt(e.target.value) || 0)}
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                          placeholder="Amount in rupees"
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Four Sharing */}
                  <div className="flex flex-col md:flex-row md:items-center md:space-x-4 p-3 border border-gray-200 rounded-md bg-white">
                    <div className="flex items-center mb-2 md:mb-0 md:w-1/3">
                      <input 
                        type="checkbox" 
                        id="fourSharing"
                        checked={pgData.fourSharing.available}
                        onChange={(e) => handleRoomTypeChange('fourSharing', 'available', e.target.checked)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor="fourSharing" className="ml-2 text-sm font-medium text-gray-700">
                        Four Sharing
                      </label>
                    </div>
                    
                    {pgData.fourSharing.available && (
                      <div className="md:w-2/3">
                        <label className="block text-xs text-gray-500 mb-1">Monthly Rent (₹)</label>
                        <input 
                          type="number" 
                          value={pgData.fourSharing.price || ''}
                          onChange={(e) => handleRoomTypeChange('fourSharing', 'price', parseInt(e.target.value) || 0)}
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                          placeholder="Amount in rupees"
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Five Sharing */}
                  <div className="flex flex-col md:flex-row md:items-center md:space-x-4 p-3 border border-gray-200 rounded-md bg-white">
                    <div className="flex items-center mb-2 md:mb-0 md:w-1/3">
                      <input 
                        type="checkbox" 
                        id="fiveSharing"
                        checked={pgData.fiveSharing.available}
                        onChange={(e) => handleRoomTypeChange('fiveSharing', 'available', e.target.checked)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor="fiveSharing" className="ml-2 text-sm font-medium text-gray-700">
                        Five Sharing
                      </label>
                    </div>
                    
                    {pgData.fiveSharing.available && (
                      <div className="md:w-2/3">
                        <label className="block text-xs text-gray-500 mb-1">Monthly Rent (₹)</label>
                        <input 
                          type="number" 
                          value={pgData.fiveSharing.price || ''}
                          onChange={(e) => handleRoomTypeChange('fiveSharing', 'price', parseInt(e.target.value) || 0)}
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                          placeholder="Amount in rupees"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Step 3: Amenities */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-800 mb-4">Basic Details</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lock-in Period (months)*
                    </label>
                    <input 
                      type="number" 
                      name="lockIn"
                      value={pgData.lockIn}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Number of months"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notice Period (months)*
                    </label>
                    <input 
                      type="number" 
                      name="noticePeriod"
                      value={pgData.noticePeriod || 1}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Number of months"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preferred Tenants*
                    </label>
                    <select
                      name="preferredTenants"
                      value={pgData.preferredTenants || 'Students & Working Professionals'}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      required
                    >
                      <option value="Students & Working Professionals">Students & Working Professionals</option>
                      <option value="Students Only">Students Only</option>
                      <option value="Working Professionals Only">Working Professionals Only</option>
                      <option value="Family">Family</option>
                      <option value="Anyone">Anyone</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Washroom Type*
                    </label>
                    <select
                      name="washroom"
                      value={pgData.washroom}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      required
                    >
                      <option value="attached">Attached</option>
                      <option value="common">Common</option>
                      <option value="both">Both (Attached & Common)</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-800 mb-4">Available Amenities</h4>
                <p className="text-sm text-gray-500 mb-4">Select all amenities that are available in the PG</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {/* Amenity: WiFi */}
                  <div className="bg-white p-3 rounded-lg border border-gray-200 flex items-center space-x-3 hover:border-primary-300 transition-colors">
                    <input
                      type="checkbox"
                      id="wifi"
                      name="wifi"
                      checked={pgData.wifi}
                      onChange={handleChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="wifi" className="flex-1 flex items-center cursor-pointer">
                      <span className="text-sm font-medium text-gray-700">WiFi</span>
                    </label>
                  </div>
                  
                  {/* Amenity: Fridge */}
                  <div className="bg-white p-3 rounded-lg border border-gray-200 flex items-center space-x-3 hover:border-primary-300 transition-colors">
                    <input
                      type="checkbox"
                      id="fridge"
                      name="fridge"
                      checked={pgData.fridge}
                      onChange={handleChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="fridge" className="flex-1 flex items-center cursor-pointer">
                      <span className="text-sm font-medium text-gray-700">Refrigerator</span>
                    </label>
                  </div>
                  
                  {/* Amenity: Washing Machine */}
                  <div className="bg-white p-3 rounded-lg border border-gray-200 flex items-center space-x-3 hover:border-primary-300 transition-colors">
                    <input
                      type="checkbox"
                      id="washingMachine"
                      name="washingMachine"
                      checked={pgData.washingMachine}
                      onChange={handleChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="washingMachine" className="flex-1 flex items-center cursor-pointer">
                      <span className="text-sm font-medium text-gray-700">Washing Machine</span>
                    </label>
                  </div>
                  
                  {/* Amenity: Housekeeping */}
                  <div className="bg-white p-3 rounded-lg border border-gray-200 flex items-center space-x-3 hover:border-primary-300 transition-colors">
                    <input
                      type="checkbox"
                      id="housekeeping"
                      name="housekeeping"
                      checked={pgData.housekeeping}
                      onChange={handleChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="housekeeping" className="flex-1 flex items-center cursor-pointer">
                      <span className="text-sm font-medium text-gray-700">Housekeeping</span>
                    </label>
                  </div>
                  
                  {/* Amenity: TV */}
                  <div className="bg-white p-3 rounded-lg border border-gray-200 flex items-center space-x-3 hover:border-primary-300 transition-colors">
                    <input
                      type="checkbox"
                      id="tv"
                      name="tv"
                      checked={pgData.tv}
                      onChange={handleChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="tv" className="flex-1 flex items-center cursor-pointer">
                      <span className="text-sm font-medium text-gray-700">TV</span>
                    </label>
                  </div>
                  
                  {/* Amenity: Parking */}
                  <div className="bg-white p-3 rounded-lg border border-gray-200 flex items-center space-x-3 hover:border-primary-300 transition-colors">
                    <input
                      type="checkbox"
                      id="parking"
                      name="parking"
                      checked={pgData.parking}
                      onChange={handleChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="parking" className="flex-1 flex items-center cursor-pointer">
                      <span className="text-sm font-medium text-gray-700">Parking</span>
                    </label>
                  </div>
                  
                  {/* Amenity: Security */}
                  <div className="bg-white p-3 rounded-lg border border-gray-200 flex items-center space-x-3 hover:border-primary-300 transition-colors">
                    <input
                      type="checkbox"
                      id="security"
                      name="security"
                      checked={pgData.security}
                      onChange={handleChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="security" className="flex-1 flex items-center cursor-pointer">
                      <span className="text-sm font-medium text-gray-700">Security</span>
                    </label>
                  </div>
                  
                  {/* Amenity: CCTV */}
                  <div className="bg-white p-3 rounded-lg border border-gray-200 flex items-center space-x-3 hover:border-primary-300 transition-colors">
                    <input
                      type="checkbox"
                      id="cctv"
                      name="cctv"
                      checked={pgData.cctv}
                      onChange={handleChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="cctv" className="flex-1 flex items-center cursor-pointer">
                      <span className="text-sm font-medium text-gray-700">CCTV Surveillance</span>
                    </label>
                  </div>
                  
                  {/* Amenity: Geyser */}
                  <div className="bg-white p-3 rounded-lg border border-gray-200 flex items-center space-x-3 hover:border-primary-300 transition-colors">
                    <input
                      type="checkbox"
                      id="geyser"
                      name="geyser"
                      checked={pgData.geyser}
                      onChange={handleChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="geyser" className="flex-1 flex items-center cursor-pointer">
                      <span className="text-sm font-medium text-gray-700">Hot Water (Geyser)</span>
                    </label>
                  </div>
                  
                  {/* Amenity: Power Backup */}
                  <div className="bg-white p-3 rounded-lg border border-gray-200 flex items-center space-x-3 hover:border-primary-300 transition-colors">
                    <input
                      type="checkbox"
                      id="powerBackup"
                      name="powerBackup"
                      checked={pgData.powerBackup}
                      onChange={handleChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="powerBackup" className="flex-1 flex items-center cursor-pointer">
                      <span className="text-sm font-medium text-gray-700">Power Backup</span>
                    </label>
                  </div>
                  
                  {/* Amenity: Lift */}
                  <div className="bg-white p-3 rounded-lg border border-gray-200 flex items-center space-x-3 hover:border-primary-300 transition-colors">
                    <input
                      type="checkbox"
                      id="lift"
                      name="lift"
                      checked={pgData.lift}
                      onChange={handleChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="lift" className="flex-1 flex items-center cursor-pointer">
                      <span className="text-sm font-medium text-gray-700">Lift/Elevator</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Step 4: Nearby Places */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-800 mb-4">Transportation</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nearest Bus Stop
                    </label>
                    <input 
                      type="text" 
                      name="nearestBusStop"
                      value={pgData.nearestBusStop}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Name and approximate distance"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nearest Metro Station
                    </label>
                    <input 
                      type="text" 
                      name="nearestMetroStation"
                      value={pgData.nearestMetroStation}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Name and approximate distance"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nearest Railway Station
                    </label>
                    <input 
                      type="text" 
                      name="nearestRailwayStation"
                      value={pgData.nearestRailwayStation}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Name and approximate distance"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nearest Airport
                    </label>
                    <input 
                      type="text" 
                      name="nearestAirport"
                      value={pgData.nearestAirport}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Name and approximate distance"
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-800 mb-4">Nearby Facilities</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nearest College/University
                    </label>
                    <input 
                      type="text" 
                      name="nearestCollege"
                      value={pgData.nearestCollege}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Name and approximate distance"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nearest Pharmacy/Medical Store
                    </label>
                    <input 
                      type="text" 
                      name="nearestPharmacy"
                      value={pgData.nearestPharmacy}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Name and approximate distance"
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nearest Supermarket/Grocery Store
                  </label>
                  <input 
                    type="text" 
                    name="nearestSupermarket"
                    value={pgData.nearestSupermarket}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Name and approximate distance"
                  />
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-6">
                <h4 className="font-medium text-gray-800 mb-4">Neighborhood & Commute Information</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Neighborhood Description
                    </label>
                    <textarea 
                      name="neighborhoodDescription"
                      value={pgData.neighborhoodDescription || ''}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Describe the neighborhood, safety, and environment"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Neighborhood Highlight
                    </label>
                    <input 
                      type="text" 
                      name="neighborhoodHighlight"
                      value={pgData.neighborhoodHighlight || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Key highlight about the neighborhood (e.g., 'Safe & Secure Area')"
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Commute Information
                  </label>
                  <textarea 
                    name="commute"
                    value={pgData.commute || ''}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Describe commute times to key locations (e.g., 'City Center (15 min), IT Park (20 min)')"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Transportation Options
                    </label>
                    <textarea 
                      name="transportation"
                      value={Array.isArray(pgData.transportation) ? pgData.transportation.join('\n') : pgData.transportation || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        setPgData(prev => ({
                          ...prev,
                          transportation: value.split('\n').filter(line => line.trim() !== '')
                        }));
                      }}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter transportation options (one per line)"
                    />
                    <p className="mt-1 text-xs text-gray-500">Enter one transportation option per line (e.g., 'Metro Station: 1.2 km (15 min walk)')</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Essential Services
                    </label>
                    <textarea 
                      name="essentialServices"
                      value={Array.isArray(pgData.essentialServices) ? pgData.essentialServices.join('\n') : pgData.essentialServices || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        setPgData(prev => ({
                          ...prev,
                          essentialServices: value.split('\n').filter(line => line.trim() !== '')
                        }));
                      }}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter essential services (one per line)"
                    />
                    <p className="mt-1 text-xs text-gray-500">Enter one service per line (e.g., 'Grocery Store: 100 m (2 min walk)')</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Step 5: Photos & Review */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-800 mb-4">Photos & Videos</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Virtual Tour Link (optional)
                    </label>
                    <input 
                      type="text" 
                      name="virtualTourLink"
                      value={pgData.virtualTourLink || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter URL for virtual tour"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Video Tour URL (optional)
                    </label>
                    <input 
                      type="text" 
                      name="videoTourUrl"
                      value={pgData.videoTourUrl || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter YouTube or other video URL"
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <h5 className="text-sm font-medium text-gray-700 mb-3">Media Gallery (Photos & Videos)</h5>
                  
                  {/* Photo Upload Form */}
                  <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Category*
                        </label>
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value as PhotoCategory)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        >
                          <optgroup label="Bedroom Types">
                            <option value="bedroom-single">Single Room</option>
                            <option value="bedroom-double">Double Sharing</option>
                            <option value="bedroom-triple">Triple Sharing</option>
                            <option value="bedroom-four">Four Sharing</option>
                            <option value="bedroom-five">Five Sharing</option>
                            <option value="bedroom">General Bedroom</option>
                          </optgroup>
                          <option value="bathroom">Bathroom</option>
                          <option value="kitchen">Kitchen</option>
                          <option value="common">Common Area</option>
                          <option value="exterior">Exterior</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Caption (optional)
                        </label>
                        <input 
                          type="text" 
                          value={photoCaption}
                          onChange={(e) => setPhotoCaption(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                          placeholder="Enter a short description"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <div className="flex items-center justify-center">
                        <label className="w-full flex flex-col items-center px-4 py-6 bg-white rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-50">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                            <p className="mt-2 text-sm text-gray-500">Click to upload or drag and drop</p>
                            <p className="text-xs text-gray-500">Photos (PNG, JPG, GIF) or Videos (MP4, MOV)</p>
                          </div>
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*,video/*"
                            onChange={handleFileChange}
                          />
                        </label>
                        {/* Photo Preview */}
                        {tempPhotoUrl && (
                          <div className="mt-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                            <div className="relative w-full h-48 bg-gray-100 rounded-md overflow-hidden">
                              <img 
                                src={tempPhotoUrl} 
                                alt="Preview" 
                                className="w-full h-full object-cover"
                              />
                              {optimizingImage && (
                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                  <div className="text-center text-white p-4">
                                    <FiLoader className="animate-spin mx-auto mb-2" size={24} />
                                    <p className="text-sm">Optimizing image...</p>
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            {optimizationStats && (
                              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                                <p className="text-sm text-green-700 font-medium">Image optimized successfully!</p>
                                <div className="mt-1 grid grid-cols-3 gap-2 text-xs text-green-600">
                                  <div>
                                    <span className="font-medium">Original:</span> {optimizationStats.original}
                                  </div>
                                  <div>
                                    <span className="font-medium">Optimized:</span> {optimizationStats.compressed}
                                  </div>
                                  <div>
                                    <span className="font-medium">Saved:</span> {optimizationStats.ratio !== 'improved' ? `${(100 - parseFloat(optimizationStats.ratio)).toFixed(0)}%` : 'space'}
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            <div className="mt-4 flex items-center">
                              <button
                                type="button"
                                onClick={handleAddPhoto}
                                disabled={uploadingImage}
                                className={`px-4 py-2 ${uploadingImage ? 'bg-gray-300 cursor-not-allowed' : 'bg-primary-500 hover:bg-primary-600'} text-white rounded-md flex items-center`}
                              >
                                {uploadingImage ? (
                                  <>
                                    <FiLoader className="animate-spin mr-2" />
                                    {optimizingImage ? 'Optimizing...' : 'Uploading...'}
                                  </>
                                ) : (
                                  <>Add to Gallery</>
                                )}
                              </button>
                              
                              <button
                                type="button"
                                onClick={() => {
                                  setTempPhotoUrl('');
                                  setOptimizationStats(null);
                                  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
                                  if (fileInput) {
                                    fileInput.value = '';
                                  }
                                }}
                                className="ml-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                              >
                                Cancel
                              </button>
                            </div>
                            
                            {uploadError && (
                              <p className="mt-2 text-sm text-red-600">{uploadError}</p>
                            )}
                          </div>
                        )}
                        
                        {/* Video Preview */}
                        {tempVideoUrl && (
                          <div className="mt-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                            <div className="relative w-full h-48 bg-gray-100 rounded-md overflow-hidden">
                              {tempVideoThumbnailUrl ? (
                                <div className="relative w-full h-full">
                                  <img 
                                    src={tempVideoThumbnailUrl} 
                                    alt="Video thumbnail" 
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="bg-black bg-opacity-50 rounded-full p-3">
                                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path>
                                      </svg>
                                    </div>
                                  </div>
                                  {videoDuration > 0 && (
                                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                                      {formatDuration(videoDuration)}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <video 
                                  src={tempVideoUrl} 
                                  controls 
                                  className="w-full h-full object-cover"
                                />
                              )}
                              {uploadingVideo && (
                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                  <div className="text-center text-white p-4 w-full max-w-xs">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-sm font-medium">{uploadProgress?.stage || 'Preparing...'}</span>
                                      <span className="text-sm">{uploadProgress?.percent || 0}%</span>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                                      <div 
                                        className="bg-blue-500 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
                                        style={{ width: `${uploadProgress?.percent || 0}%` }}
                                      ></div>
                                    </div>
                                    {optimizingVideo && (
                                      <div className="mt-2 flex items-center justify-center">
                                        <FiLoader className="animate-spin mr-2" size={16} />
                                        <p className="text-xs">Optimizing for faster playback</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            {videoOptimizationStats && (
                              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                                <p className="text-sm text-green-700 font-medium">Video processed successfully!</p>
                                <div className="mt-1 grid grid-cols-3 gap-2 text-xs text-green-600">
                                  <div>
                                    <span className="font-medium">Original:</span> {videoOptimizationStats.original}
                                  </div>
                                  <div>
                                    <span className="font-medium">Processed:</span> {videoOptimizationStats.compressed}
                                  </div>
                                  <div>
                                    <span className="font-medium">Method:</span> {videoOptimizationStats.ratio}
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            <div className="mt-4 flex items-center">
                              <button
                                type="button"
                                onClick={handleAddPhoto}
                                disabled={uploadingVideo}
                                className={`px-4 py-2 ${uploadingVideo ? 'bg-gray-300 cursor-not-allowed' : 'bg-primary-500 hover:bg-primary-600'} text-white rounded-md flex items-center`}
                              >
                                {uploadingVideo ? (
                                  <>
                                    <FiLoader className="animate-spin mr-2" />
                                    {optimizingVideo ? 'Processing...' : 'Uploading...'}
                                  </>
                                ) : (
                                  <>Add to Gallery</>
                                )}
                              </button>
                              
                              <button
                                type="button"
                                onClick={() => {
                                  setTempVideoUrl('');
                                  setTempVideoThumbnailUrl('');
                                  setVideoCaption('');
                                  setVideoDuration(0);
                                  setVideoOptimizationStats(null);
                                  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
                                  if (fileInput) {
                                    fileInput.value = '';
                                  }
                                }}
                                className="ml-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                              >
                                Cancel
                              </button>
                            </div>
                            
                            {videoUploadError && (
                              <p className="mt-2 text-sm text-red-600">{videoUploadError}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Combined Media Gallery */}
                  <div className="mt-4">
                    {/* Display Photos and Videos */}
                    {(pgData.photos.length > 0 || (pgData.videos && pgData.videos.length > 0)) ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {/* Photos */}
                        {pgData.photos.map((photo, index) => (
                          <div key={`photo-${index}`} className="relative group rounded-lg overflow-hidden border border-gray-200">
                            <img 
                              src={photo.url} 
                              alt={photo.caption || `Photo ${index + 1}`} 
                              className="w-full h-40 object-cover"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <button 
                                  type="button"
                                  onClick={() => handleRemovePhoto(index)}
                                  className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                                >
                                  <FiTrash2 size={16} />
                                </button>
                              </div>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-2">
                              <div className="flex items-center">
                                <span className="bg-blue-500 text-xs px-2 py-0.5 rounded mr-2">Photo</span>
                                <div className="text-xs font-medium uppercase tracking-wider">{photo.category}</div>
                              </div>
                              {photo.caption && <div className="text-sm truncate">{photo.caption}</div>}
                            </div>
                          </div>
                        ))}
                        
                        {/* Videos */}
                        {pgData.videos && pgData.videos.map((video, index) => (
                          <div key={`video-${index}`} className="relative group rounded-lg overflow-hidden border border-gray-200">
                            <div className="relative w-full h-40">
                              <img 
                                src={video.thumbnailUrl} 
                                alt={video.caption || `Video ${index + 1}`} 
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-black bg-opacity-50 rounded-full p-3">
                                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path>
                                  </svg>
                                </div>
                              </div>
                              {video.duration > 0 && (
                                <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                                  {formatDuration(video.duration)}
                                </div>
                              )}
                            </div>
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <button 
                                  type="button"
                                  onClick={() => handleRemoveVideo(index)}
                                  className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                                >
                                  <FiTrash2 size={16} />
                                </button>
                              </div>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-2">
                              <div className="flex items-center">
                                <span className="bg-purple-500 text-xs px-2 py-0.5 rounded mr-2">Video</span>
                                <div className="text-xs font-medium uppercase tracking-wider">{video.category}</div>
                              </div>
                              {video.caption && <div className="text-sm truncate">{video.caption}</div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
                        <p className="text-gray-500">No media added yet. Add photos and videos to showcase the PG.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-800 mb-4">Review Information</h4>
                <p className="text-sm text-gray-500 mb-4">Please review all the information before submitting</p>
                
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h5 className="font-medium text-gray-700 mb-2">Basic Information</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">PG Name</p>
                        <p className="text-sm font-medium">{pgData.name || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Branch</p>
                        <p className="text-sm font-medium">{pgData.branch || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Contact Person</p>
                        <p className="text-sm font-medium">{pgData.contactName || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Contact Phone</p>
                        <p className="text-sm font-medium">{pgData.contactPhone || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Gender</p>
                        <p className="text-sm font-medium capitalize">{pgData.gender}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="text-sm font-medium">{pgData.location || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h5 className="font-medium text-gray-700 mb-2">Capacity & Pricing</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Total Beds</p>
                        <p className="text-sm font-medium">{pgData.beds}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Security Deposit</p>
                        <p className="text-sm font-medium">₹{pgData.deposit}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Food Included</p>
                        <p className="text-sm font-medium">{pgData.food ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <p className="text-sm text-gray-500 mb-2">Available Room Types</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {pgData.oneSharing.available && (
                          <div className="text-sm bg-gray-50 p-2 rounded">
                            One Sharing: ₹{pgData.oneSharing.price || 'Price not set'}
                          </div>
                        )}
                        {pgData.twoSharing.available && (
                          <div className="text-sm bg-gray-50 p-2 rounded">
                            Two Sharing: ₹{pgData.twoSharing.price || 'Price not set'}
                          </div>
                        )}
                        {pgData.threeSharing.available && (
                          <div className="text-sm bg-gray-50 p-2 rounded">
                            Three Sharing: ₹{pgData.threeSharing.price || 'Price not set'}
                          </div>
                        )}
                        {pgData.fourSharing.available && (
                          <div className="text-sm bg-gray-50 p-2 rounded">
                            Four Sharing: ₹{pgData.fourSharing.price || 'Price not set'}
                          </div>
                        )}
                        {pgData.fiveSharing.available && (
                          <div className="text-sm bg-gray-50 p-2 rounded">
                            Five Sharing: ₹{pgData.fiveSharing.price || 'Price not set'}
                          </div>
                        )}
                        {!pgData.oneSharing.available && !pgData.twoSharing.available && 
                         !pgData.threeSharing.available && !pgData.fourSharing.available && 
                         !pgData.fiveSharing.available && (
                          <div className="text-sm text-gray-500">No room types selected</div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h5 className="font-medium text-gray-700 mb-2">Amenities & Features</h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <div>
                        <p className="text-sm text-gray-500">Lock-in Period</p>
                        <p className="text-sm font-medium">{pgData.lockIn} months</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Washroom Type</p>
                        <p className="text-sm font-medium capitalize">{pgData.washroom}</p>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <p className="text-sm text-gray-500 mb-2">Available Amenities</p>
                      <div className="flex flex-wrap gap-2">
                        {pgData.wifi && <span className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded-full">WiFi</span>}
                        {pgData.fridge && <span className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded-full">Refrigerator</span>}
                        {pgData.washingMachine && <span className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded-full">Washing Machine</span>}
                        {pgData.housekeeping && <span className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded-full">Housekeeping</span>}
                        {pgData.tv && <span className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded-full">TV</span>}
                        {pgData.parking && <span className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded-full">Parking</span>}
                        {pgData.security && <span className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded-full">Security</span>}
                        {!pgData.wifi && !pgData.fridge && !pgData.washingMachine && 
                         !pgData.housekeeping && !pgData.tv && !pgData.parking && 
                         !pgData.security && (
                          <span className="text-sm text-gray-500">No amenities selected</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h5 className="font-medium text-gray-700 mb-2">Media</h5>
                    <p className="text-sm text-gray-500 mb-2">Photos: {pgData.photos.length} uploaded</p>
                    {pgData.virtualTourLink && (
                      <p className="text-sm">
                        <span className="text-gray-500">Virtual Tour:</span> 
                        <a href={pgData.virtualTourLink} target="_blank" rel="noopener noreferrer" className="text-primary-600 ml-1 hover:underline">
                          {pgData.virtualTourLink}
                        </a>
                      </p>
                    )}
                    {pgData.videoTourUrl && (
                      <p className="text-sm">
                        <span className="text-gray-500">Video Tour:</span> 
                        <a href={pgData.videoTourUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 ml-1 hover:underline">
                          {pgData.videoTourUrl}
                        </a>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`px-4 py-2 rounded-md flex items-center ${
              currentStep === 1 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FiArrowLeft className="mr-2" size={16} />
            Previous
          </button>
          
          <button
            type="button"
            onClick={nextStep}
            className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 flex items-center"
          >
            {currentStep === totalSteps ? 'Submit' : 'Next'}
            {currentStep !== totalSteps && <FiArrowRight className="ml-2" size={16} />}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PGOnboardingModal;
