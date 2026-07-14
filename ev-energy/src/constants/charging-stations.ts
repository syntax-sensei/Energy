import type { ChargingStation } from '@/types/charging-station';

/** Roughly centered on Condongcatur, Sleman, Yogyakarta. */
export const MapCenter = {
  latitude: -7.7638,
  longitude: 110.3985,
};

export const ChargingStations: ChargingStation[] = [
  {
    id: 'ketandan',
    name: 'SPKLU Ketandan',
    latitude: -7.7598,
    longitude: 110.3958,
    availablePorts: 0,
    totalPorts: 4,
  },
  {
    id: 'ngawi',
    name: 'SPKLU Ngawi',
    latitude: -7.7652,
    longitude: 110.394,
    availablePorts: 1,
    totalPorts: 4,
  },
  {
    id: 'sagan',
    name: 'SPKLU Sagan',
    latitude: -7.7622,
    longitude: 110.4028,
    availablePorts: 1,
    totalPorts: 4,
  },
  {
    id: 'deresan',
    name: 'SPKLU Deresan',
    latitude: -7.7688,
    longitude: 110.3965,
    availablePorts: 3,
    totalPorts: 4,
  },
];

export const DestinationStation: ChargingStation = {
  id: 'demangan',
  name: 'SPKLU Demangan',
  latitude: -7.7582,
  longitude: 110.3998,
  availablePorts: 3,
  totalPorts: 4,
};
