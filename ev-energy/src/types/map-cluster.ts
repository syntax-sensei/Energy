import type { ChargingStation } from '@/types/charging-station';

/**
 * Discriminated union for what the map should render at the current zoom.
 * Clusters carry a point_count that recursively includes nested clusters
 * (e.g. 5 + 10 → 15) — Supercluster owns that math.
 */
export type MapClusterItem =
  | {
      kind: 'station';
      station: ChargingStation;
    }
  | {
      kind: 'cluster';
      /** Supercluster cluster_id — needed for expansion zoom on press. */
      clusterId: number;
      count: number;
      latitude: number;
      longitude: number;
    };
