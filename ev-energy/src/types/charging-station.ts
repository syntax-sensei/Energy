export type ChargingStation = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  /** Port counts when known (e.g. from our own backend). Optional for Places results. */
  availablePorts?: number;
  totalPorts?: number;
};
