import Supercluster from 'supercluster';

import type { MapClusterItem } from '@/types/map-cluster';
import type { ChargingStation } from '@/types/charging-station';
import {
  regionFromCenterAndZoom,
  regionToBBox,
  zoomFromLatitudeDelta,
  type MapRegionLike,
} from '@/utils/geo-region';

/** Point feature props — one station per leaf. */
type StationProps = {
  station: ChargingStation;
};

type StationFeature = Supercluster.PointFeature<StationProps>;

export type ChargerClusterIndex = Supercluster<StationProps, Supercluster.AnyProps>;

/**
 * Tuned for mobile charger maps (less aggressive = more individual pins):
 * - radius: how close (in tile pixels) points must be to merge — lower = less clustering
 * - maxZoom: above this zoom, every charger is shown individually — lower = splits sooner
 * - minPoints: need at least 2 chargers to form a cluster
 */
const CLUSTER_OPTIONS: Supercluster.Options<StationProps, Supercluster.AnyProps> = {
  radius: 36,
  maxZoom: 14,
  minZoom: 0,
  minPoints: 2,
};

function toFeature(station: ChargingStation): StationFeature {
  return {
    type: 'Feature',
    properties: { station },
    geometry: {
      type: 'Point',
      coordinates: [station.longitude, station.latitude],
    },
  };
}

/** Build an immutable Supercluster index for the current station set. */
export function createChargerClusterIndex(
  stations: ChargingStation[],
): ChargerClusterIndex {
  const index = new Supercluster<StationProps, Supercluster.AnyProps>(CLUSTER_OPTIONS);
  index.load(stations.map(toFeature));
  return index;
}

/**
 * Returns the markers to draw for the visible region at the current zoom.
 * Recursive clustering is handled inside Supercluster — cluster.count is the
 * total leaf chargers under that node (5 + 10 = 15).
 */
export function getClustersForRegion(
  index: ChargerClusterIndex,
  region: MapRegionLike,
): MapClusterItem[] {
  const zoom = zoomFromLatitudeDelta(region.latitudeDelta);
  const bbox = regionToBBox(region);
  const features = index.getClusters(bbox, zoom);

  return features.map((feature): MapClusterItem => {
    const [longitude, latitude] = feature.geometry.coordinates;
    const props = feature.properties;

    if ('cluster' in props && props.cluster) {
      return {
        kind: 'cluster',
        clusterId: props.cluster_id,
        count: props.point_count,
        latitude,
        longitude,
      };
    }

    return {
      kind: 'station',
      station: (props as StationProps).station,
    };
  });
}

/**
 * Region to animate toward so a tapped cluster expands into its children
 * (the next zoom level where that cluster splits).
 */
export function getClusterExpansionRegion(
  index: ChargerClusterIndex,
  clusterId: number,
  latitude: number,
  longitude: number,
): MapRegionLike {
  const expansionZoom = index.getClusterExpansionZoom(clusterId);
  // Nudge one level past the expansion threshold so the cluster actually splits.
  return regionFromCenterAndZoom(latitude, longitude, expansionZoom + 1);
}
