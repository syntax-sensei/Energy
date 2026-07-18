import { distanceMeters } from '@/services/nearby-chargers';
import type { LatLng } from '@/types/charging-station';

/** Rough urban average used to estimate drive time from straight-line distance. */
const AVG_DRIVE_KMH = 45;

export function formatDriveDistance(
  from: LatLng | null | undefined,
  to: LatLng,
): string {
  if (!from) {
    return 'Distance unavailable';
  }

  const meters = distanceMeters(from, to);
  const kilometers = meters / 1000;
  const minutes = Math.max(1, Math.round((kilometers / AVG_DRIVE_KMH) * 60));
  const kmLabel = kilometers < 10 ? kilometers.toFixed(1) : kilometers.toFixed(0);

  return `${minutes} mins driving (${kmLabel} km)`;
}
