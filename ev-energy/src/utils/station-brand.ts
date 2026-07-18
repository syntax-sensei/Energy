export type StationBrand = {
  name: string;
  /** Accent used for the brand mark. */
  color: string;
  /** Short mark shown in the logo badge (e.g. "T"). */
  mark: string;
};

const BRANDS: Array<{ pattern: RegExp; brand: StationBrand }> = [
  { pattern: /\btesla\b/i, brand: { name: 'Tesla', color: '#E31937', mark: 'T' } },
  {
    pattern: /\belectrify\s*america\b/i,
    brand: { name: 'Electrify America', color: '#0072CE', mark: 'EA' },
  },
  {
    pattern: /\bchargepoint\b/i,
    brand: { name: 'ChargePoint', color: '#2E7D32', mark: 'CP' },
  },
  { pattern: /\bevgo\b/i, brand: { name: 'EVgo', color: '#00A3E0', mark: 'E' } },
  {
    pattern: /\bbp\s*pulse\b|\bpulse\b/i,
    brand: { name: 'bp pulse', color: '#007F3B', mark: 'bp' },
  },
  {
    pattern: /\bshell\s*recharge\b/i,
    brand: { name: 'Shell Recharge', color: '#DD1D21', mark: 'S' },
  },
  {
    pattern: /\bionity\b/i,
    brand: { name: 'IONITY', color: '#1A1A1A', mark: 'I' },
  },
];

const FALLBACK: StationBrand = {
  name: 'EV Network',
  color: '#1C1C1E',
  mark: 'EV',
};

/** Resolve a charging-network brand from the Places display name. */
export function resolveStationBrand(stationName: string): StationBrand {
  for (const entry of BRANDS) {
    if (entry.pattern.test(stationName)) {
      return entry.brand;
    }
  }
  return FALLBACK;
}
