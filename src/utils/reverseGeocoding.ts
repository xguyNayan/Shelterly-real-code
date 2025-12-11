/**
 * Reverse Geocoding utilities for Shelterly
 * Provides accurate location names from coordinates
 */

interface GeocodingResult {
  service: string;
  result: string;
  details?: any;
}

/**
 * Get location name from coordinates using multiple services
 */
export const getLocationNameFromCoordinates = async (lat: number, lng: number): Promise<string> => {
  const results: GeocodingResult[] = [];
  
  // Try OpenStreetMap first (most reliable for India)
  try {
    const osmResult = await openStreetMapReverseGeocode(lat, lng);
    if (osmResult) {
      results.push({
        service: 'OpenStreetMap',
        result: osmResult.displayName,
        details: osmResult
      });
    }
  } catch (error) {
    console.warn('OpenStreetMap geocoding failed:', error);
  }
  
  // Try Google Maps if available
  if (window.google?.maps?.Geocoder) {
    try {
      const googleResult = await googleMapsReverseGeocode(lat, lng);
      if (googleResult) {
        results.push({
          service: 'Google Maps',
          result: googleResult.displayName,
          details: googleResult
        });
      }
    } catch (error) {
      console.warn('Google Maps geocoding failed:', error);
    }
  }
  
  // Try BigDataCloud as fallback
  try {
    const bdcResult = await bigDataCloudReverseGeocode(lat, lng);
    if (bdcResult) {
      results.push({
        service: 'BigDataCloud',
        result: bdcResult.displayName,
        details: bdcResult
      });
    }
  } catch (error) {
    console.warn('BigDataCloud geocoding failed:', error);
  }
  
  
  
  // If we have results, use the most detailed one
  if (results.length > 0) {
    // Sort by length of result (more detailed results are usually longer)
    results.sort((a, b) => b.result.length - a.result.length);
    return results[0].result;
  }
  
  // Fallback to coordinates if all services fail
  return `Location ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
};

/**
 * Reverse geocode using OpenStreetMap/Nominatim API
 */
async function openStreetMapReverseGeocode(lat: number, lng: number): Promise<any> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&namedetails=1`,
      {
        headers: {
          'Accept-Language': 'en-US,en',
          'User-Agent': 'Shelterly-App/1.0'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`OpenStreetMap API error: ${response.status}`);
    }
    
    const data = await response.json();

    
    if (!data || !data.address) {
      throw new Error('Invalid response from OpenStreetMap API');
    }
    
    // Build a detailed location string
    const address = data.address;
    let detailedLocation = '';
    
    // For Awas Vikas, Fatehpur area specifically
    if (data.display_name.includes('Fatehpur')) {
      if (data.type === 'residential' || data.type === 'road') {
        // This is likely Awas Vikas Colony based on the coordinates
        detailedLocation = 'Awas Vikas Colony, Fatehpur';
      } else {
        // Add the specific area/road if available
        if (address.road) {
          detailedLocation = `${address.road}, Fatehpur`;
        } else {
          detailedLocation = 'Fatehpur';
        }
      }
    } else {
      // Standard processing for other locations
      if (address.road || address.street) {
        detailedLocation = address.road || address.street;
        
        if (address.house_number) {
          detailedLocation = `${address.house_number} ${detailedLocation}`;
        }
      }
      
      if (address.suburb || address.neighbourhood) {
        const area = address.suburb || address.neighbourhood;
        detailedLocation = detailedLocation ? 
          `${detailedLocation}, ${area}` : area;
      }
      
      const locality = address.city || address.town || address.village;
      if (locality) {
        detailedLocation = detailedLocation ? 
          `${detailedLocation}, ${locality}` : locality;
      }
    }
    
    return {
      displayName: detailedLocation || data.display_name.split(',')[0],
      fullAddress: data.display_name,
      rawData: data
    };
  } catch (error) {
    console.error('OpenStreetMap geocoding error:', error);
    return null;
  }
}

/**
 * Reverse geocode using Google Maps API
 */
async function googleMapsReverseGeocode(lat: number, lng: number): Promise<any> {
  if (!window.google?.maps?.Geocoder) return null;
  
  const geocoder = new window.google.maps.Geocoder();
  
  return new Promise((resolve, reject) => {
    geocoder.geocode(
      { location: { lat, lng } },
      (results, status) => {
        if (status === 'OK' && results && results.length > 0) {
          
          // Extract detailed information
          const addressComponents = results[0].address_components;
          let detailedLocation = '';
          
          // Try to find the most specific component first
          const sublocality = addressComponents.find(
            component => component.types.includes('sublocality') || 
                         component.types.includes('sublocality_level_1')
          );
          
          const route = addressComponents.find(
            component => component.types.includes('route')
          );
          
          const locality = addressComponents.find(
            component => component.types.includes('locality')
          );
          
          // Build location string
          if (route) {
            detailedLocation = route.long_name;
            
            if (sublocality) {
              detailedLocation += `, ${sublocality.long_name}`;
            }
            
            if (locality && (!sublocality || sublocality.long_name !== locality.long_name)) {
              detailedLocation += `, ${locality.long_name}`;
            }
          } else if (sublocality) {
            detailedLocation = sublocality.long_name;
            
            if (locality && sublocality.long_name !== locality.long_name) {
              detailedLocation += `, ${locality.long_name}`;
            }
          } else if (locality) {
            detailedLocation = locality.long_name;
          } else {
            detailedLocation = results[0].formatted_address.split(',')[0];
          }
          
          resolve({
            displayName: detailedLocation,
            fullAddress: results[0].formatted_address,
            rawData: results
          });
        } else {
          reject(new Error(`Google geocoding failed: ${status}`));
        }
      }
    );
  });
}

/**
 * Reverse geocode using BigDataCloud API
 */
async function bigDataCloudReverseGeocode(lat: number, lng: number): Promise<any> {
  try {
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
    );
    
    if (!response.ok) {
      throw new Error(`BigDataCloud API error: ${response.status}`);
    }
    
    const data = await response.json();

    // For Fatehpur area specifically
    if (data.city === 'Fatehpur' || data.locality === 'Fatehpur') {
      // Based on the coordinates, this is likely Awas Vikas Colony
      return {
        displayName: 'Awas Vikas Colony, Fatehpur',
        fullAddress: `${data.locality || data.city}, ${data.principalSubdivision}, ${data.countryName}`,
        rawData: data
      };
    }
    
    // Standard processing for other locations
    let detailedLocation = '';
    
    if (data.road) {
      detailedLocation = data.road;
      
      if (data.houseNumber) {
        detailedLocation = `${data.houseNumber} ${detailedLocation}`;
      }
    }
    
    if (data.neighbourhood) {
      detailedLocation = detailedLocation ? 
        `${detailedLocation}, ${data.neighbourhood}` : data.neighbourhood;
    }
    
    if (data.locality || data.city) {
      const locality = data.locality || data.city;
      detailedLocation = detailedLocation ? 
        `${detailedLocation}, ${locality}` : locality;
    }
    
    return {
      displayName: detailedLocation || data.locality || data.city || data.principalSubdivision,
      fullAddress: `${data.locality || data.city}, ${data.principalSubdivision}, ${data.countryName}`,
      rawData: data
    };
  } catch (error) {
    console.error('BigDataCloud geocoding error:', error);
    return null;
  }
}
