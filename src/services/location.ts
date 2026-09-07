// Location system removed in favor of strict official schedule timetable timing.
export interface UserCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
}

export async function requestLocationPermission(): Promise<boolean> {
  return false;
}

export async function getCurrentUserLocation(): Promise<UserCoordinates | null> {
  return null;
}
