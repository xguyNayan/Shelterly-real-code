import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUpload, FiX, FiCheck, FiDownload } from 'react-icons/fi';
import * as XLSX from 'xlsx';
import { PGData } from './PGOnboardingModal';

interface PGBulkUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (pgs: PGData[]) => void;
}

const PGBulkUpload: React.FC<PGBulkUploadProps> = ({ isOpen, onClose, onUpload }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PGData[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [step, setStep] = useState<'upload' | 'preview' | 'confirm'>('upload');

  // Generate a template Excel file for download
  const generateTemplate = () => {
    // Create a template with all required fields
    const template: any[] = [{
      // Basic Information
      name: 'Example PG Name',
      contactName: 'John Doe',
      contactPhone: '9876543210',
      gender: 'unisex', // Options: male, female, unisex
      branch: 'Main Branch',
      address: '123 Main Street, City',
      location: 'City Center',
      status: 'initial', // Options: initial, verification, listing, active
      
      // Capacity and Pricing
      beds: 10,
      food: 'true', // Use 'true' or 'false' as strings
      deposit: 5000,
      
      // Room Types (available as 'true'/'false', price as number)
      oneSharing_available: 'true',
      oneSharing_price: 8000,
      twoSharing_available: 'true',
      twoSharing_price: 6000,
      threeSharing_available: 'false',
      threeSharing_price: 4000,
      fourSharing_available: 'false',
      fourSharing_price: 3000,
      
      // Amenities (all as 'true'/'false' strings)
      amenities_washroom: 'true',
      amenities_fridge: 'true',
      amenities_wifi: 'true',
      amenities_washingMachine: 'false',
      amenities_housekeeping: 'true',
      amenities_parking: 'false',
      amenities_security: 'true',
      amenities_ac: 'false',
      amenities_tv: 'true',
      amenities_powerBackup: 'true',
      amenities_cook: 'false',
      amenities_gym: 'false',
      
      // Nearby Places
      nearbyPlaces_busStop: '100m',
      nearbyPlaces_metroStation: '1km',
      nearbyPlaces_railwayStation: '3km',
      nearbyPlaces_airport: '15km',
      nearbyPlaces_college: '500m',
      nearbyPlaces_pharmacy: '200m',
      nearbyPlaces_supermarket: '300m',
    }];
    
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'PG Template');
    
    // Generate the file and trigger download
    XLSX.writeFile(wb, 'pg_upload_template.xlsx');
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
    }
  };

  // Parse Excel file
  const parseExcel = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

      if (jsonData.length === 0) {
        setError('The uploaded file contains no data');
        setLoading(false);
        return;
      }

      // Transform the flat Excel data into structured PG data
      const transformedData: PGData[] = jsonData.map((row) => {
        // Helper function to convert string 'true'/'false' to boolean
        const strToBool = (value: string | undefined) => 
          value?.toLowerCase() === 'true';

        // Create structured PG data
        const pgData: PGData = {
          // Basic Information
          name: row.name || '',
          contactName: row.contactName || '',
          contactPhone: row.contactPhone || '',
          gender: (row.gender as 'male' | 'female' | 'unisex') || 'unisex',
          branch: row.branch || '',
          address: row.address || '',
          location: row.location || '',
          status: (row.status as 'initial' | 'verification' | 'listing' | 'active') || 'initial',
          
          // Capacity and Pricing
          beds: Number(row.beds) || 0,
          food: strToBool(row.food),
          deposit: row.deposit ? String(row.deposit) : '1 month',
          
          // Room Types and Pricing
          oneSharing: { 
            available: strToBool(row.oneSharing_available),
            price: Number(row.oneSharing_price) || 0
          },
          twoSharing: { 
            available: strToBool(row.twoSharing_available),
            price: Number(row.twoSharing_price) || 0
          },
          threeSharing: { 
            available: strToBool(row.threeSharing_available),
            price: Number(row.threeSharing_price) || 0
          },
          fourSharing: { 
            available: strToBool(row.fourSharing_available),
            price: Number(row.fourSharing_price) || 0
          },
          fiveSharing: { 
            available: strToBool(row.fiveSharing_available),
            price: Number(row.fiveSharing_price) || 0
          },
          // Lock-in period
          lockIn: Number(row.lockIn) || 3,
          
          // Amenities
          washroom: (row.amenities_washroom as 'attached' | 'common' | 'both') || 'common',
          fridge: strToBool(row.amenities_fridge),
          wifi: strToBool(row.amenities_wifi),
          washingMachine: strToBool(row.amenities_washingMachine),
          housekeeping: strToBool(row.amenities_housekeeping),
          parking: strToBool(row.amenities_parking),
          security: strToBool(row.amenities_security),
          tv: strToBool(row.amenities_tv),
          ac: strToBool(row.amenities_ac),
          powerBackup: strToBool(row.amenities_powerBackup),
          geyser: strToBool(row.amenities_geyser),
          furnishing: (row.amenities_furnishing as 'fully' | 'semi' | 'unfurnished') || 'semi',
          
          // Nearby Places
          nearestBusStop: row.nearbyPlaces_busStop || '',
          nearestMetroStation: row.nearbyPlaces_metroStation || '',
          nearestRailwayStation: row.nearbyPlaces_railwayStation || '',
          nearestAirport: row.nearbyPlaces_airport || '',
          nearestCollege: row.nearbyPlaces_college || '',
          nearestPharmacy: row.nearbyPlaces_pharmacy || '',
          nearestSupermarket: row.nearbyPlaces_supermarket || '',
          
          // Media - will be empty for bulk uploads
          photos: [],
        };

        return pgData;
      });

      setPreview(transformedData);
      setStep('preview');
    } catch (err) {
      console.error('Error parsing Excel file:', err);
      setError('Failed to parse the Excel file. Please make sure it\'s in the correct format.');
    } finally {
      setLoading(false);
    }
  };

  // Handle confirmation and submit data
  const handleConfirm = () => {
    if (preview.length === 0) {
      setError('No data to upload');
      return;
    }

    onUpload(preview);
    setStep('confirm');
  };

  // Reset the form
  const handleReset = () => {
    setFile(null);
    setPreview([]);
    setError('');
    setStep('upload');
  };

  // Close the modal
  const handleClose = () => {
    handleReset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Bulk Upload PGs</h2>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <FiX size={24} />
            </button>
          </div>

          {error && (
            <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {step === 'upload' && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">
                      Upload an Excel file with PG data
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      File should be in .xlsx format
                    </p>
                  </div>
                  <input
                    type="file"
                    id="file-upload"
                    accept=".xlsx, .xls"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="mt-4 flex justify-center">
                    <label
                      htmlFor="file-upload"
                      className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 cursor-pointer"
                    >
                      Select File
                    </label>
                  </div>
                  {file && (
                    <p className="mt-2 text-sm text-gray-600">
                      Selected: {file.name}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <button
                  onClick={generateTemplate}
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <FiDownload className="mr-2" /> Download Template
                </button>
                <button
                  onClick={parseExcel}
                  disabled={!file || loading}
                  className={`px-4 py-2 rounded-md text-white flex items-center ${
                    !file || loading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-primary-500 hover:bg-primary-600'
                  }`}
                >
                  {loading ? 'Processing...' : 'Next'}
                </button>
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-6">
              <div className="text-sm text-gray-600 mb-4">
                Preview of data to be uploaded ({preview.length} PGs):
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Gender
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Branch
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Beds
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {preview.slice(0, 5).map((pg, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {pg.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {pg.address}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {pg.contactName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {pg.contactPhone}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {pg.gender}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {pg.branch}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {pg.beds}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              pg.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : pg.status === 'verification'
                                ? 'bg-yellow-100 text-yellow-800'
                                : pg.status === 'listing'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {pg.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {preview.length > 5 && (
                <div className="text-sm text-gray-500 italic">
                  Showing 5 of {preview.length} PGs
                </div>
              )}

              <div className="flex justify-between">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirm}
                  className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 flex items-center"
                >
                  <FiCheck className="mr-2" /> Confirm Upload
                </button>
              </div>
            </div>
          )}

          {step === 'confirm' && (
            <div className="text-center py-8">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <FiCheck className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="mt-2 text-lg font-medium text-gray-900">
                Upload Successful
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                {preview.length} PGs have been successfully uploaded.
              </p>
              <div className="mt-6">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default PGBulkUpload;
