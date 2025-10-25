
import { useState, useRef, useCallback } from 'react';

export const useCamera = () => {
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' } // Default to rear camera
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsCameraOn(true);
        setError(null);
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Could not access the camera. Please check permissions.");
        setIsCameraOn(false);
      }
    } else {
      setError("Camera not supported by this browser.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraOn(false);
  }, []);

  const captureFrame = useCallback((): { base64: string; mimeType: string } | null => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        return { base64: dataUrl.split(',')[1], mimeType: 'image/jpeg' };
      }
    }
    return null;
  }, []);

  return {
    videoRef,
    isCameraOn,
    error,
    startCamera,
    stopCamera,
    captureFrame,
  };
};
