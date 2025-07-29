// TypeScript interfaces for device identity
export interface DeviceIdentifier {
  ip?: string;
  imei?: string;
  phone?: string;
  iccid?: string;
  coords?: { lat: number; lon: number };
}

export interface DeviceHistory {
  timestamp: number;
  lat: number;
  lon: number;
  source: string;
}

export interface DeviceInfo {
  ip?: string;
  imei?: string;
  phone?: string;
  iccid?: string;
  coords?: { lat: number; lon: number };
  registrationZone?: string | null;
  history: DeviceHistory[];
}
