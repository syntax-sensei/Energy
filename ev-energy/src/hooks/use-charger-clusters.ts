import { useMemo } from 'react';

import {
  createChargerClusterIndex,
  getClusterExpansionRegion,
  getClustersForRegion,
  type ChargerClusterIndex,
} from '@/services/charger-clustering';
import type { MapClusterItem } from '@/types/map-cluster';
import type { ChargingStation } from '@/types/charging-station';
import type { MapRegionLike } from '@/utils/geo-region';

type UseChargerClustersResult = {
  items: MapClusterItem[];
  /** Stable index for cluster expansion; null when there are no stations. */
  index: ChargerClusterIndex | null;
  getExpansionRegion: (
    clusterId: number,
    latitude: number,
    longitude: number,
  ) => MapRegionLike | null;
};

/**
 * Keeps the Supercluster index in sync with `stations` and recomputes the
 * visible leaves/clusters whenever the map region changes.
 */
export function useChargerClusters(
  stations: ChargingStation[],
  region: MapRegionLike | null,
): UseChargerClustersResult {
  const index = useMemo(
    () => (stations.length > 0 ? createChargerClusterIndex(stations) : null),
    [stations],
  );

  const items = useMemo(() => {
    if (!index || !region) {
      return [] as MapClusterItem[];
    }
    return getClustersForRegion(index, region);
  }, [index, region]);

  const getExpansionRegion = useMemo(() => {
    return (clusterId: number, latitude: number, longitude: number) => {
      if (!index) {
        return null;
      }
      return getClusterExpansionRegion(index, clusterId, latitude, longitude);
    };
  }, [index]);

  return { items, index, getExpansionRegion };
}
