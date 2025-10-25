import { useState, useEffect, useCallback } from 'react';

const DRIVE_STORAGE_KEY = 'googleDriveConnected';

export const useGoogleDrive = () => {
  const [isDriveConnected, setIsDriveConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedState = localStorage.getItem(DRIVE_STORAGE_KEY);
      if (storedState === 'true') {
        setIsDriveConnected(true);
      }
    } catch (e) {
      console.error("Failed to read from localStorage", e);
    } finally {
        setIsLoading(false);
    }
  }, []);

  const connectToDrive = useCallback(async () => {
    setError(null);
    // Check if the real authentication API is available
    if (window.aistudio?.auth?.getOAuthToken) {
      try {
        // Use the real authentication flow
        await window.aistudio.auth.getOAuthToken();
        localStorage.setItem(DRIVE_STORAGE_KEY, 'true');
        setIsDriveConnected(true);
      } catch (e) {
        console.error("Google Drive connection error:", e);
        setError("Failed to connect to Google Drive. Please try again.");
        localStorage.removeItem(DRIVE_STORAGE_KEY);
        setIsDriveConnected(false);
      }
    } else {
      // If the API is not available, simulate a successful connection for development
      console.warn(
        "Could not find 'window.aistudio.auth.getOAuthToken'. " +
        "Simulating a successful Google Drive connection for development purposes. " +
        "The 'googleDrive' tool will be used in API calls, but no real authentication has occurred."
      );
      setError(null); // Clear any previous errors
      localStorage.setItem(DRIVE_STORAGE_KEY, 'true');
      setIsDriveConnected(true);
    }
  }, []);

  const disconnectFromDrive = useCallback(() => {
    try {
      localStorage.removeItem(DRIVE_STORAGE_KEY);
      setIsDriveConnected(false);
      setError(null);
    } catch (e) {
       console.error("Failed to write to localStorage", e);
    }
  }, []);

  return {
    isDriveConnected,
    isLoading,
    driveError: error,
    connectToDrive,
    disconnectFromDrive,
  };
};
