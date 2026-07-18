import type { StationMetrics } from '@/types/charging-station';

/** Deterministic dummy metrics so the same station always shows the same numbers. */
export function getDummyStationMetrics(stationId: string): StationMetrics {
  let hash = 0;
  for (let i = 0; i < stationId.length; i += 1) {
    hash = (hash * 31 + stationId.charCodeAt(i)) >>> 0;
  }

  return {
    chargerCount: 4 + (hash % 9),
    powerKwh: [50, 75, 120, 150, 250, 350][hash % 6],
    amenityExtraCount: 1 + (hash % 4),
  };
}
