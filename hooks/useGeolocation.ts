import { useState, useEffect } from 'react';

export interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
}

export const useGeolocation = () => {
  const [location, setLocation] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation((prev) => ({
        ...prev,
        error: 'Geolocation is not supported by your browser.',
      }));
      return;
    }

    const handleSuccess = (position: GeolocationPosition) => {
      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        error: null,
      });
    };

    const handleError = (error: GeolocationPositionError) => {
      let errorMessage = 'An unknown error occurred.';
      switch (error.code) {
          case error.PERMISSION_DENIED:
              errorMessage = "User denied the request for Geolocation.";
              break;
          case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information is unavailable.";
              break;
          case error.TIMEOUT:
              errorMessage = "The request to get user location timed out.";
              break;
      }
      setLocation((prev) => ({
        ...prev,
        error: errorMessage
      }));
    };

    const watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    });

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  return location;
};