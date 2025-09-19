import { type GeoCoordinates } from '../types.ts';

const geoCache = new Map<string, GeoCoordinates | null>();

export const getCoordinates = async (address: string): Promise<GeoCoordinates | null> => {
  if (geoCache.has(address)) {
    return geoCache.get(address) || null;
  }

  if (!address.trim()) return null;
  
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
  
  try {
    // A User-Agent is required by Nominatim's usage policy.
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'TherapistSchedulerApp/1.0'
      }
    });
    if (!response.ok) {
      console.error('Nominatim API request failed');
      geoCache.set(address, null);
      return null;
    }
    const data = await response.json();
    if (data && data.length > 0) {
      const coords = { lat: data[0].lat, lon: data[0].lon };
      geoCache.set(address, coords);
      return coords;
    }
    geoCache.set(address, null);
    return null;
  } catch (error) {
    console.error('Error fetching coordinates:', error);
    geoCache.set(address, null);
    return null;
  }
};

export const calculateDistance = (coord1: GeoCoordinates, coord2: GeoCoordinates): number => {
  if (!coord1 || !coord2) return Infinity;

  const R = 3959; // Radius of the Earth in miles
  const lat1 = parseFloat(coord1.lat);
  const lon1 = parseFloat(coord1.lon);
  const lat2 = parseFloat(coord2.lat);
  const lon2 = parseFloat(coord2.lon);

  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in miles
};