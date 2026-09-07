import { Platform, Alert } from 'react-native';
import * as Location from 'expo-location';

export interface UserCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
}

/**
 * Requests foreground location permission from the user.
 * Works across Android (Runtime permission dialog), iOS (NSLocationWhenInUse), and Web (navigator.geolocation).
 */
export async function requestLocationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') {
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      return true; // Web requests permission at the time of calling getCurrentPosition
    }
    return false;
  }

  try {
    const { status: existingStatus } = await Location.getForegroundPermissionsAsync();
    if (existingStatus === 'granted') {
      return true;
    }

    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.warn('Error requesting location permissions:', error);
    return false;
  }
}

/**
 * Safely fetches the current device GPS position.
 * Handles permission request, GPS disabled error, and fallbacks.
 */
export async function getCurrentUserLocation(): Promise<UserCoordinates | null> {
  if (Platform.OS === 'web') {
    return new Promise((resolve) => {
      if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            resolve({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: pos.coords.accuracy,
            });
          },
          (err) => {
            console.warn('Web Geolocation error:', err);
            Alert.alert(
              'Location Access',
              'Please allow location permission in your browser to auto-detect your nearest bus stop.'
            );
            resolve(null);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
        );
      } else {
        Alert.alert('Location Unavailable', 'Geolocation is not supported in this browser.');
        resolve(null);
      }
    });
  }

  try {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      Alert.alert(
        'Location Permission Required',
        'Tatpar BRTS needs location permission to find your closest bus shelter and calculate real-time walking distances.'
      );
      return null;
    }

    // Check if location services are enabled on device
    const isServicesEnabled = await Location.hasServicesEnabledAsync();
    if (!isServicesEnabled) {
      Alert.alert(
        'GPS Is Turned Off',
        'Please turn on Location / GPS on your phone to detect your nearest bus shelter.'
      );
      return null;
    }

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
    };
  } catch (error) {
    console.warn('Error obtaining user location:', error);
    Alert.alert(
      'Location Error',
      'Could not determine your current location. Please check your GPS signal and try again.'
    );
    return null;
  }
}
