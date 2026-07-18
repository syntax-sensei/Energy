/**
 * Lightweight region shape used by map clustering.
 * Mirrors react-native-maps Region without importing the native module
 * (keeps services/hooks testable and RN-agnostic).
 */
export type MapRegionLike = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

/** GeoJSON bbox: [westLng, southLat, eastLng, northLat]. */
export type GeoBBox = [number, number, number, number];

/** Convert a map region into a Supercluster/GeoJSON bounding box. */
export function regionToBBox(region: MapRegionLike): GeoBBox {
  const halfLat = region.latitudeDelta / 2;
  const halfLng = region.longitudeDelta / 2;
  return [
    region.longitude - halfLng,
    region.latitude - halfLat,
    region.longitude + halfLng,
    region.latitude + halfLat,
  ];
}

/**
 * Approximate Web-Mercator zoom from latitudeDelta.
 * Supercluster expects an integer zoom; we floor so clusters form slightly
 * earlier while zooming out (feels more like the reference apps).
 */
export function zoomFromLatitudeDelta(latitudeDelta: number): number {
  const safeDelta = Math.max(latitudeDelta, 1e-6);
  return Math.max(0, Math.floor(Math.log2(360 / safeDelta)));
}

/** Inverse of zoomFromLatitudeDelta — used when expanding a cluster on press. */
export function latitudeDeltaFromZoom(zoom: number): number {
  return 360 / Math.pow(2, Math.max(0, zoom));
}

export function regionFromCenterAndZoom(
  latitude: number,
  longitude: number,
  zoom: number,
): MapRegionLike {
  const latitudeDelta = latitudeDeltaFromZoom(zoom);
  return {
    latitude,
    longitude,
    latitudeDelta,
    longitudeDelta: latitudeDelta,
  };
}
