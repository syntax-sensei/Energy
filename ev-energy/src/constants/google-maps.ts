/**
 * Client-side Maps/Places key from EXPO_PUBLIC_GOOGLE_MAPS_API_KEY (.env).
 * Restrict this key in Cloud Console — it ships in the app binary by design.
 */
export const GoogleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

if (__DEV__ && !GoogleMapsApiKey) {
  console.warn(
    '[ev-energy] Missing EXPO_PUBLIC_GOOGLE_MAPS_API_KEY. Copy .env.example to .env and add your key.',
  );
}
