/**
 * Geolocation utility functions for Shelterly
 * Provides reliable access to user's current location
 */

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
  isCached?: boolean;
}

export enum GeolocationErrorType {
  PERMISSION_DENIED = 1,
  POSITION_UNAVAILABLE = 2,
  TIMEOUT = 3,
  UNKNOWN = 4
}

export interface GeolocationError {
  code: GeolocationErrorType;
  message: string;
}

export const getCurrentLocation = (options: {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  retryAttempts?: number;
  retryDelay?: number;
  fallbackToLastKnownPosition?: boolean;
} = {}): Promise<LocationData> => {
  const defaultOptions = {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 0,
    retryAttempts: 3,
    retryDelay: 2000,
    fallbackToLastKnownPosition: true,
  };

  const mergedOptions = { ...defaultOptions, ...options };
  let attempts = 0;

  const attemptGetLocation = (): Promise<LocationData> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        return reject({
          code: GeolocationErrorType.UNKNOWN,
          message: 'Geolocation is not supported by this browser',
        });
      }

       (`Attempting location fetch (attempt ${attempts + 1})`);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (position.coords.accuracy > 50 && attempts < mergedOptions.retryAttempts) {
            console.warn('Low accuracy detected, retrying...');
            attempts++;
            return setTimeout(() => {
              attemptGetLocation().then(resolve).catch(reject);
            }, mergedOptions.retryDelay);
          }

          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          });
        },
        (error) => {
          let errorMessage = 'An unknown error occurred while retrieving location';
          switch (error.code) {
            case GeolocationErrorType.PERMISSION_DENIED:
              errorMessage = 'Permission denied';
              return reject({ code: error.code, message: errorMessage });
            case GeolocationErrorType.POSITION_UNAVAILABLE:
              errorMessage = 'Position unavailable';
              break;
            case GeolocationErrorType.TIMEOUT:
              errorMessage = 'Request timed out';
              break;
          }

          if (attempts < mergedOptions.retryAttempts) {
            attempts++;
            return setTimeout(() => {
              attemptGetLocation().then(resolve).catch(reject);
            }, mergedOptions.retryDelay);
          }

          if (mergedOptions.fallbackToLastKnownPosition) {
            navigator.geolocation.getCurrentPosition(
              (cachedPosition) => {
                resolve({
                  latitude: cachedPosition.coords.latitude,
                  longitude: cachedPosition.coords.longitude,
                  accuracy: cachedPosition.coords.accuracy,
                  timestamp: cachedPosition.timestamp,
                  isCached: true,
                });
              },
              () => {
                reject({ code: error.code, message: errorMessage });
              },
              {
                maximumAge: Infinity,
                timeout: 7000,
                enableHighAccuracy: false,
              }
            );
          } else {
            reject({ code: error.code, message: errorMessage });
          }
        },
        {
          enableHighAccuracy: mergedOptions.enableHighAccuracy,
          timeout: mergedOptions.timeout,
          maximumAge: mergedOptions.maximumAge,
        }
      );
    });
  };

  return attemptGetLocation();
};

export const watchLocation = (
  successCallback: (location: LocationData) => void,
  errorCallback: (error: GeolocationError) => void,
  options: {
    enableHighAccuracy?: boolean;
    timeout?: number;
    maximumAge?: number;
  } = {}
): number => {
  const defaultOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0,
  };

  const mergedOptions = { ...defaultOptions, ...options };

  if (!navigator.geolocation) {
    errorCallback({
      code: GeolocationErrorType.UNKNOWN,
      message: 'Geolocation is not supported by this browser',
    });
    return -1;
  }

  return navigator.geolocation.watchPosition(
    (position) => {
      successCallback({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp,
      });
    },
    (error) => {
      let message = 'An unknown error occurred';
      switch (error.code) {
        case GeolocationErrorType.PERMISSION_DENIED:
          message = 'Permission denied';
          break;
        case GeolocationErrorType.POSITION_UNAVAILABLE:
          message = 'Position unavailable';
          break;
        case GeolocationErrorType.TIMEOUT:
          message = 'Request timed out';
          break;
      }
      errorCallback({ code: error.code, message });
    },
    mergedOptions
  );
};

export const clearLocationWatch = (watcherId: number): void => {
  if (watcherId !== -1 && navigator.geolocation) {
    navigator.geolocation.clearWatch(watcherId);
  }
};

export const isGeolocationSupported = (): boolean => {
  return !!navigator.geolocation;
};

export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth radius in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const deg2rad = (deg: number): number => deg * (Math.PI / 180);
