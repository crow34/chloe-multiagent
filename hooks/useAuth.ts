import { useState, useEffect, useCallback } from 'react';
// FIX: Corrected import path for types
import type { User } from '../types';

// Mock user data for demonstration purposes.
// In a real application, this would come from an authentication provider.
const MOCK_USER: User = {
  name: 'Martin',
  email: 'thermal24@gmail.com',
  photoURL: 'mock_photo_url', // Using a string to be handled as a fallback by UI
};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  // Simulate checking for an existing session on component mount.
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const storedUser = sessionStorage.getItem('authUser');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Failed to parse user from sessionStorage", error);
        sessionStorage.removeItem('authUser');
      } finally {
        setInitializing(false);
      }
    };
    
    // Simulate network delay for checking auth status
    const timer = setTimeout(checkAuthStatus, 500);

    return () => clearTimeout(timer);
  }, []);

  const login = useCallback(() => {
    setInitializing(true);
    // Simulate a successful login after a short delay.
    setTimeout(() => {
      try {
        sessionStorage.setItem('authUser', JSON.stringify(MOCK_USER));
        setUser(MOCK_USER);
      } catch (error) {
        console.error("Failed to save user to sessionStorage", error);
      } finally {
        setInitializing(false);
      }
    }, 500);
  }, []);

  const logout = useCallback(() => {
    try {
      sessionStorage.removeItem('authUser');
    } catch (error) {
      console.error("Failed to remove user from sessionStorage", error);
    }
    setUser(null);
  }, []);

  return { user, initializing, login, logout };
};