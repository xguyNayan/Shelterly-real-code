/**
 * Waits for Google Maps API to be loaded
 * @param maxAttempts Maximum number of attempts to check if Google Maps is loaded
 * @param interval Interval between attempts in milliseconds
 * @returns Promise that resolves when Google Maps is loaded
 */
const waitForGoogleMapsToLoad = (maxAttempts = 10, interval = 500): Promise<void> => {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    
    const checkGoogleMaps = () => {
      attempts++;
      
      if (window.google && window.google.maps && window.google.maps.Geocoder) {
        resolve();
        return;
      }
      
      if (attempts >= maxAttempts) {
        reject(new Error('Google Maps API failed to load after multiple attempts'));
        return;
      }
      
      setTimeout(checkGoogleMaps, interval);
    };
    
    checkGoogleMaps();
  });
};

/**
 * Converts a location name to coordinates using Google Maps Geocoding API
 * @param locationName The name of the location to geocode
 * @returns Promise with the coordinates {lat, lng}
 */
export const getCoordinatesFromLocationName = async (locationName: string): Promise<{lat: number, lng: number}> => {
  try {
    // Wait for Google Maps to load (with retry mechanism)
    await waitForGoogleMapsToLoad();
    
    const geocoder = new window.google.maps.Geocoder();
    
    // Try with the exact address first
    return new Promise((resolve, reject) => {
      // First try with the exact address provided
      geocoder.geocode(
        { address: locationName },
        (results: google.maps.GeocoderResult[], status: google.maps.GeocoderStatus) => {
          if (status === 'OK' && results && results.length > 0) {
            const location = results[0].geometry.location;
            // Ensure we always get numbers for lat and lng
            const lat = typeof location.lat === 'function' ? location.lat() : Number(location.lat);
            const lng = typeof location.lng === 'function' ? location.lng() : Number(location.lng);
            
            resolve({ lat, lng });
          } else {
            // If the exact address fails, try with city context
            
            geocoder.geocode(
              { address: `${locationName}, Bangalore, India` },
              (cityResults: google.maps.GeocoderResult[], cityStatus: google.maps.GeocoderStatus) => {
                if (cityStatus === 'OK' && cityResults && cityResults.length > 0) {
                  const cityLocation = cityResults[0].geometry.location;
                  const cityLat = typeof cityLocation.lat === 'function' ? cityLocation.lat() : Number(cityLocation.lat);
                  const cityLng = typeof cityLocation.lng === 'function' ? cityLocation.lng() : Number(cityLocation.lng);
                  
                   
                  resolve({ lat: cityLat, lng: cityLng });
                } else {
                  reject(new Error(`Google geocoding failed for address "${locationName}" with status: ${cityStatus}`));
                }
              }
            );
          }
        }
      );
    });
  } catch (error) {
    console.error('Error during location name to coordinates conversion:', error);
    throw error;
  }
};
