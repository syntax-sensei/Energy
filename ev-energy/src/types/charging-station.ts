export type ChargingStation = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  /** Formatted street address when available from Places. */
  address?: string;
  /** Port counts when known (e.g. from our own backend). Optional for Places results. */
  availablePorts?: number;
  totalPorts?: number;
};

export type StationMetrics = {
  chargerCount: number;
  powerKwh: number;
  amenityExtraCount: number;
};

export type LatLng = {
  latitude: number;
  longitude: number;
};
