import React, { lazy, Suspense } from 'react';
import { FiMapPin, FiNavigation, FiClock, FiMap } from 'react-icons/fi';
import { PGData } from '../PGListing/types';
import { getCoordinatesFromLocationName } from '../../utils/geocoding';

// Lazy load the Google Maps components
const GoogleMapComponent = lazy(() => import('@react-google-maps/api').then(module => ({
  default: module.GoogleMap
})));

const MarkerComponent = lazy(() => import('@react-google-maps/api').then(module => ({
  default: module.MarkerF
})));

// We don't lazy load useLoadScript as it's a hook, not a component
// Instead, we'll manually load the Google Maps script when needed

interface PGLocationProps {
  pg: PGData;
}

// Get nearby places from PG data or use defaults
const getNearbyPlaces = (pg: PGData) => {
  if (pg.nearbyPlaces && Array.isArray(pg.nearbyPlaces) && pg.nearbyPlaces.length > 0) {
    return pg.nearbyPlaces;
  }
  
  // Default nearby places if not provided
  return [
    { type: 'College', name: pg.nearestCollege || 'Educational Institution', distance: '0.5 km', time: '6 mins' },
    { type: 'Metro Station', name: 'City Metro', distance: '1.2 km', time: '15 mins' },
    { type: 'Hospital', name: 'City Hospital', distance: '2.0 km', time: '10 mins' },
    { type: 'Shopping Mall', name: 'Central Mall', distance: '1.5 km', time: '18 mins' },
    { type: 'Restaurant', name: 'Food Court', distance: '0.3 km', time: '4 mins' },
    { type: 'Park', name: 'City Park', distance: '0.8 km', time: '10 mins' },
  ];
};

const mapContainerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '24px',
};

const options = {
  disableDefaultUI: true,
  zoomControl: true,
  styles: [
    {
      featureType: 'all',
      elementType: 'geometry',
      stylers: [{ color: '#242f3e' }],
    },
    {
      featureType: 'all',
      elementType: 'labels.text.stroke',
      stylers: [{ color: '#242f3e' }, { lightness: 10 }],
    },
    {
      featureType: 'all',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#746855' }],
    },
    {
      featureType: 'administrative.locality',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#d59563' }],
    },
    {
      featureType: 'poi',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#d59563' }],
    },
    {
      featureType: 'poi.park',
      elementType: 'geometry',
      stylers: [{ color: '#263c3f' }],
    },
    {
      featureType: 'poi.park',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#6b9a76' }],
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{ color: '#38414e' }],
    },
    {
      featureType: 'road',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#212a37' }],
    },
    {
      featureType: 'road',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#9ca5b3' }],
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry',
      stylers: [{ color: '#746855' }],
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#1f2835' }],
    },
    {
      featureType: 'road.highway',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#f3d19c' }],
    },
    {
      featureType: 'transit',
      elementType: 'geometry',
      stylers: [{ color: '#2f3948' }],
    },
    {
      featureType: 'transit.station',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#d59563' }],
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#17263c' }],
    },
    {
      featureType: 'water',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#515c6d' }],
    },
    {
      featureType: 'water',
      elementType: 'labels.text.stroke',
      stylers: [{ color: '#17263c' }],
    },
  ],
};

const PGLocation: React.FC<PGLocationProps> = ({ pg }) => {
  const [center, setCenter] = React.useState({
    lat: pg.coordinates?.lat || 12.9716,
    lng: pg.coordinates?.lng || 77.5946,
  });
  const [isGeocodingComplete, setIsGeocodingComplete] = React.useState(false);
  
  // Use a state to track if we should load the map (for performance)
  const [shouldLoadMap, setShouldLoadMap] = React.useState(false);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [loadError, setLoadError] = React.useState<Error | null>(null);
  
  // Use IntersectionObserver to detect when the map container is in viewport
  React.useEffect(() => {
    const mapContainerRef = document.getElementById('map-container');
    if (!mapContainerRef) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShouldLoadMap(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 } // Start loading when 10% of the element is visible
    );
    
    observer.observe(mapContainerRef);
    
    return () => {
      observer.disconnect();
    };
  }, []);
  
  // Load the map script when needed
  React.useEffect(() => {
    if (!shouldLoadMap) return;
    
    const loadMapScript = async () => {
      try {
        // Load the script manually for better control
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY || ''}&libraries=places,geometry`;
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
          setIsLoaded(true);
        };
        
        script.onerror = (error) => {
          setLoadError(new Error('Failed to load Google Maps script'));
        };
        
        document.head.appendChild(script);
      } catch (error) {
        setLoadError(error as Error);
      }
    };
    
    loadMapScript();
  }, [shouldLoadMap]);
  
  // State to track geocoding status
  const [geocodingError, setGeocodingError] = React.useState(false);
  const [geocodingAttempts, setGeocodingAttempts] = React.useState(0);
  
  // Geocode the address if coordinates are missing or invalid
  React.useEffect(() => {
    const geocodeAddress = async () => {
      // Reset error state on each attempt
      setGeocodingError(false);
      
      // If we already have valid coordinates, use them
      if (pg.coordinates?.lat && pg.coordinates?.lng && 
          pg.coordinates.lat !== 12.9716 && pg.coordinates.lng !== 77.5946) {
        setCenter({
          lat: pg.coordinates.lat,
          lng: pg.coordinates.lng
        });
        setIsGeocodingComplete(true);
        return;
      }
      
      // If we have an address but no coordinates, geocode it
      if (pg.address) {
        try {
          
          // Try geocoding with the full address including location/locality if available
          const fullAddress = pg.location ? `${pg.address}, ${pg.location}` : pg.address;
          const { lat, lng } = await getCoordinatesFromLocationName(fullAddress);
          
          if (lat && lng) {
           
            setCenter({ lat, lng });
            
            // Store these coordinates in localStorage for future use
            try {
              const pgCoordinatesCache = JSON.parse(localStorage.getItem('pgCoordinatesCache') || '{}');
              pgCoordinatesCache[pg.id] = { lat, lng };
              localStorage.setItem('pgCoordinatesCache', JSON.stringify(pgCoordinatesCache));
            } catch (cacheError) {
              console.error('Error caching coordinates:', cacheError);
            }
          }
        } catch (error) {
          console.error('Error geocoding address:', error);
          setGeocodingError(true);
          
          // Try again with a different approach if we have fewer than 2 attempts
          if (geocodingAttempts < 2) {
            setGeocodingAttempts(prev => prev + 1);
            return; // Don't set geocodingComplete yet
          }
        }
      }
      
      setIsGeocodingComplete(true);
    };
    
    geocodeAddress();
  }, [pg.coordinates, pg.address, pg.location, pg.id, geocodingAttempts]);
  
  const renderMap = () => {
    return (
      <Suspense fallback={<div className="w-full h-[400px] flex flex-col items-center justify-center bg-gray-100 rounded-[24px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-primary-500 mb-4"></div>
        <p className="text-gray-600 text-sm">Loading map...</p>
      </div>}>
        {window.google && (
          <GoogleMapComponent
            mapContainerStyle={mapContainerStyle}
            zoom={16} // Increased zoom for better visibility
            center={center}
            options={options}
          >
            <MarkerComponent
              position={center}
              icon={{
                // Use a more visible marker with fallback
                url: '/images/home-marker.svg',
                scaledSize: new window.google.maps.Size(50, 50), // Larger marker
                origin: new window.google.maps.Point(0, 0),
                anchor: new window.google.maps.Point(20, 40),
              }}
            />
          </GoogleMapComponent>
        )}
      </Suspense>
    );
  };
  
  if (loadError) {
    return (
      <div className="bg-white rounded-[30px] p-6 shadow-sm text-center">
        <h3 className="text-xl font-semibold text-primary-800 mb-2">Error Loading Map</h3>
        <p className="text-gray-600">Sorry, we couldn't load the map. Please try again later.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Location header with quirky design */}
      <div className="relative bg-gradient-to-r from-primary-50 to-blue-50 rounded-[30px] p-8 mb-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-200 opacity-30 rounded-bl-full"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-200 opacity-30 rounded-tr-full"></div>
        
        <h2 className="text-2xl font-bold text-primary-800 mb-3 relative z-10">Location & Nearby Places</h2>
        <div className="flex items-center text-gray-700 relative z-10">
          <FiMapPin className="mr-2 text-primary-500" />
          <p>{pg.address}, {pg.location}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Map */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[30px] p-6 shadow-sm h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-primary-800">Map View</h3>
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${center.lat},${center.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-primary-600 hover:text-primary-700 transition-colors"
              >
                <FiNavigation className="mr-1" />
                <span>Get Directions</span>
              </a>
            </div>
            
            {/* Map container */}
            <div id="map-container" className="relative rounded-[24px] overflow-hidden">
              {shouldLoadMap && isLoaded && isGeocodingComplete ? renderMap() : (
                <div className="w-full h-[400px] flex flex-col items-center justify-center bg-gray-100 rounded-[24px]">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-primary-500 mb-4"></div>
                  <p className="text-gray-600 text-sm">
                    {!shouldLoadMap ? 'Scroll to load map' : !isLoaded ? 'Loading map...' : 'Finding exact location...'}
                  </p>
                </div>
              )}
              
              {/* Map overlay with quirky design */}
              <div className="absolute top-4 left-4 bg-white rounded-full px-4 py-2 shadow-md z-10">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-primary-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium">{pg.name}</span>
                </div>
              </div>
              
              {/* Accuracy indicator */}
              {isLoaded && isGeocodingComplete && (
                <div className="absolute bottom-4 right-4 bg-white rounded-lg px-3 py-1.5 shadow-md text-xs z-10">
                  <div className="flex items-center">
                    <FiMapPin className="text-primary-500 mr-1.5" />
                    <span>{pg.coordinates?.lat && pg.coordinates?.lng ? 'Exact location' : 'Approximate location'}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Nearby places */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-[30px] p-6 shadow-sm h-full">
            <h3 className="text-xl font-semibold text-primary-800 mb-4">Nearby Places</h3>
            
            <div className="space-y-4">
              {getNearbyPlaces(pg).map((place, index) => (
                <div 
                  key={index}
                  className="flex items-start p-3 rounded-2xl hover:bg-gray-50 transition-colors"
                >
                  <div className="mr-3 p-2 bg-primary-100 text-primary-600 rounded-full">
                    <FiMap size={18} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-primary-800">{place.name}</h4>
                        <p className="text-sm text-gray-600">{place.type}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-primary-800">{place.distance}</p>
                        <div className="flex items-center text-sm text-gray-600">
                          <FiClock className="mr-1" size={12} />
                          <span>{place.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Neighborhood information */}
      <div className="bg-white rounded-[30px] p-6 shadow-sm mb-8">
        <h3 className="text-xl font-semibold text-primary-800 mb-4">About the Neighborhood</h3>
        
        <p className="text-gray-700 mb-4">
          {pg.neighborhoodDescription || `${pg.name} is located in ${pg.location || 'a convenient area'}, a vibrant and well-connected area of the city. The neighborhood is known for its safety, convenience, and proximity to ${pg.nearestCollege || 'educational institutions'}, making it an ideal choice for students and working professionals.`}
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="bg-gray-50 rounded-[20px] p-5">
            <h4 className="font-semibold text-primary-800 mb-3">Transportation</h4>
            <ul className="space-y-2 text-gray-700">
              {pg.transportation ? (
                // If transportation data exists in PG data, map through it
                Array.isArray(pg.transportation) ? 
                  pg.transportation.map((item, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="inline-block w-2 h-2 rounded-full bg-primary-500 mt-2 mr-3"></span>
                      <span>{item}</span>
                    </li>
                  )) : 
                  // If it's a string, just show one item
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 rounded-full bg-primary-500 mt-2 mr-3"></span>
                    <span>{pg.transportation}</span>
                  </li>
              ) : (
                // Default transportation options
                <>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 rounded-full bg-primary-500 mt-2 mr-3"></span>
                    <span>Metro Station: 1.2 km (15 min walk)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 rounded-full bg-primary-500 mt-2 mr-3"></span>
                    <span>Bus Stop: 200 m (3 min walk)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 rounded-full bg-primary-500 mt-2 mr-3"></span>
                    <span>Auto/Taxi Stand: 300 m (4 min walk)</span>
                  </li>
                </>
              )}
            </ul>
          </div>
          
          <div className="bg-gray-50 rounded-[20px] p-5">
            <h4 className="font-semibold text-primary-800 mb-3">Essential Services</h4>
            <ul className="space-y-2 text-gray-700">
              {pg.essentialServices ? (
                // If essential services data exists in PG data, map through it
                Array.isArray(pg.essentialServices) ? 
                  pg.essentialServices.map((item, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="inline-block w-2 h-2 rounded-full bg-primary-500 mt-2 mr-3"></span>
                      <span>{item}</span>
                    </li>
                  )) : 
                  // If it's a string, just show one item
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 rounded-full bg-primary-500 mt-2 mr-3"></span>
                    <span>{pg.essentialServices}</span>
                  </li>
              ) : (
                // Default essential services
                <>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 rounded-full bg-primary-500 mt-2 mr-3"></span>
                    <span>Grocery Store: 100 m (2 min walk)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 rounded-full bg-primary-500 mt-2 mr-3"></span>
                    <span>ATM: 250 m (3 min walk)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 rounded-full bg-primary-500 mt-2 mr-3"></span>
                    <span>Pharmacy: 300 m (4 min walk)</span>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PGLocation;
