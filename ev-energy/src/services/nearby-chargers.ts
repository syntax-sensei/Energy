import { GoogleMapsApiKey } from '@/constants/google-maps';
import type { ChargingStation } from '@/types/charging-station';

type PlacesNearbyResponse = {
  places?: Array<{
    id?: string;
    displayName?: { text?: string };
    location?: { latitude?: number; longitude?: number };
  }>;
  error?: { message?: string; status?: string };
};

type NearbyChargersParams = {
  latitude: number;
  longitude: number;
  /** Search radius in meters (max 50_000 for Places Nearby). */
  radiusMeters?: number;
};

/**
 * Fetches EV charging stations near a point via Places API (New).
 * Replaces Google Maps' built-in green spark POIs with data we can map to custom markers.
 */
export async function fetchNearbyChargers({
  latitude,
  longitude,
  radiusMeters = 2500,
}: NearbyChargersParams): Promise<ChargingStation[]> {
  const response = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': GoogleMapsApiKey,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.location',
    },
    body: JSON.stringify({
      includedTypes: ['electric_vehicle_charging_station'],
      maxResultCount: 20,
      locationRestriction: {
        circle: {
          center: { latitude, longitude },
          radius: radiusMeters,
        },
      },
    }),
  });

  const data = (await response.json()) as PlacesNearbyResponse;

  if (!response.ok) {
    throw new Error(data.error?.message ?? `Places Nearby failed (${response.status})`);
  }

  return (data.places ?? [])
    .filter(
      (place): place is Required<Pick<typeof place, 'id'>> & typeof place =>
        Boolean(place.id) &&
        place.location?.latitude != null &&
        place.location?.longitude != null,
    )
    .map((place) => ({
      id: place.id!,
      name: place.displayName?.text?.trim() || 'Charging station',
      latitude: place.location!.latitude!,
      longitude: place.location!.longitude!,
    }));
}

/**
 * Rough meters covered by the taller side of the map region, capped so we only ever
 * ask Places for "nearby" results (never a whole-city/whole-country radius) — keeps
 * each request cheap and relevant regardless of how far the user zooms out.
 */
export function radiusFromRegion(latitudeDelta: number, longitudeDelta: number): number {
  const latMeters = latitudeDelta * 111_320;
  const lonMeters = longitudeDelta * 111_320 * Math.cos((Math.PI / 180) * (latitudeDelta / 2));
  return Math.min(Math.max(Math.max(latMeters, lonMeters) / 2, 800), 5_000);
}

/** Great-circle distance in meters between two coordinates. */
export function distanceMeters(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
): number {
  const earthRadius = 6_371_000;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;

  const sinLat = Math.sin(dLat / 2);
  const sinLon = Math.sin(dLon / 2);
  const h = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLon * sinLon;
  return 2 * earthRadius * Math.asin(Math.min(1, Math.sqrt(h)));
}
