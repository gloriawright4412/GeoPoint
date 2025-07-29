// --- Clear UI/UX: Suggestions for displaying results to users ---
// - Show estimated accuracy/confidence visually (e.g., colored bar, text)
// - Display which sources contributed (GPS, WiFi, IP, etc.)
// - Allow user to manually refine or override location if needed
// - Indicate when fallback or low-confidence results are used
// --- Extensive Testing: Scaffold for future test cases ---
// To be implemented in a separate test file (e.g., triangulation.test.ts)
// Example:
// import { triangulatePosition, getSourceConfidence, kalmanSmoothPositions, smoothWithHistory } from './triangulation';
// describe('triangulation', () => {
//   it('should return correct centroid for multiple sources', () => { ... });
//   it('should filter outliers', () => { ... });
//   it('should fallback gracefully', () => { ... });
//   it('should smooth history', () => { ... });
//   it('should apply Kalman filter', () => { ... });
// });
// --- Battery Optimization: Hooks for adaptive polling (to be used in client logic) ---
// Example usage:
// if (batteryLevel < 0.2) { reducePollingFrequency(); useLowPowerSources(); }
// This module does not implement polling, but exposes hooks for integration.
// --- Privacy Controls: Hooks for privacy-aware location handling ---
// In production, use these flags to respect user privacy preferences in UI and backend.
export interface PrivacyOptions {
  allowPreciseLocation?: boolean;
  allowHistoryStorage?: boolean;
  allowSharing?: boolean;
}

// Example usage in your app (not enforced in this module):
// if (!privacy.allowPreciseLocation) { /* degrade accuracy or prompt user */ }
// --- User Feedback Loop: Placeholder for user-reported corrections ---
// In production, connect this to a backend or analytics system.
export function submitLocationFeedback(
  userId: string,
  reportedLat: number,
  reportedLon: number,
  context?: any
): void {
  // TODO: Send feedback to backend for analysis and model improvement
  // Example: fetch('/api/feedback', { method: 'POST', body: JSON.stringify({ userId, reportedLat, reportedLon, context }) })
  // For now, just log
  console.log('User feedback received:', { userId, reportedLat, reportedLon, context });
}
// --- Historical Smoothing: Use recent history to smooth sudden jumps ---
// Maintains a rolling window of positions and returns a smoothed average
export function smoothWithHistory(
  history: { lat: number; lon: number }[],
  windowSize: number = 5
): { lat: number; lon: number } {
  const window = history.slice(-windowSize);
  if (window.length === 0) return { lat: 0, lon: 0 };
  const avgLat = window.reduce((sum, p) => sum + p.lat, 0) / window.length;
  const avgLon = window.reduce((sum, p) => sum + p.lon, 0) / window.length;
  return { lat: avgLat, lon: avgLon };
}
export interface PositionSource {
    latitude: number;
    longitude: number;
    accuracy: number;
    source: 'gps' | 'network' | 'ip' | 'wifi' | 'cellular';
    timestamp: number;
    confidence: number; // 0-1 scale
  }
  
  export interface TriangulatedPosition {
    latitude: number;
    longitude: number;
    accuracy: number;
    confidence: number;
    sources: PositionSource[];
    method: 'single' | 'weighted_average' | 'triangulation';
  }
  

// Earth's radius in meters
const EARTH_RADIUS = 6371000;

// --- Hybrid Location Fusion: Simple Kalman Filter for Position Smoothing ---
// This filter can be used to smooth noisy position data and fuse multiple sources.
// For production, consider a more advanced multi-dimensional Kalman filter or libraries.
class KalmanFilter {
  private x: number; // latitude
  private y: number; // longitude
  private p: number; // estimation error covariance
  private q: number; // process noise covariance
  private r: number; // measurement noise covariance
  private k: number; // Kalman gain

  constructor(initialLat: number, initialLon: number, processNoise = 1, measurementNoise = 10) {
    this.x = initialLat;
    this.y = initialLon;
    this.p = 1;
    this.q = processNoise;
    this.r = measurementNoise;
    this.k = 0;
  }

  update(measuredLat: number, measuredLon: number) {
    // Latitude
    this.p = this.p + this.q;
    this.k = this.p / (this.p + this.r);
    this.x = this.x + this.k * (measuredLat - this.x);
    this.p = (1 - this.k) * this.p;
    // Longitude
    this.p = this.p + this.q;
    this.k = this.p / (this.p + this.r);
    this.y = this.y + this.k * (measuredLon - this.y);
    this.p = (1 - this.k) * this.p;
    return { lat: this.x, lon: this.y };
  }
}

// Utility to apply Kalman filter to a sequence of positions
export function kalmanSmoothPositions(positions: { lat: number; lon: number }[]): { lat: number; lon: number }[] {
  if (positions.length === 0) return [];
  const kf = new KalmanFilter(positions[0].lat, positions[0].lon);
  const smoothed: { lat: number; lon: number }[] = [];
  for (const pos of positions) {
    smoothed.push(kf.update(pos.lat, pos.lon));
  }
  return smoothed;
}
  
  // Convert degrees to radians
  function toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
  
  // Convert radians to degrees
  function toDegrees(radians: number): number {
    return radians * (180 / Math.PI);
  }
  
  // Calculate distance between two points using Haversine formula
  export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return EARTH_RADIUS * c;
  }
  

// Outlier detection: Remove sources that are far from the centroid (e.g., >2 std dev)
function filterOutliers(sources: PositionSource[]): PositionSource[] {
  if (sources.length < 3) return sources;
  const centroid = calculateWeightedCentroidRaw(sources);
  const distances = sources.map(s => calculateDistance(s.latitude, s.longitude, centroid.lat, centroid.lon));
  const mean = distances.reduce((a, b) => a + b, 0) / distances.length;
  const std = Math.sqrt(distances.reduce((acc, d) => acc + Math.pow(d - mean, 2), 0) / distances.length);
  // Keep sources within 2 standard deviations
  return sources.filter((s, i) => distances[i] <= mean + 2 * std);
}

// Raw centroid (no outlier removal)
function calculateWeightedCentroidRaw(sources: PositionSource[]): { lat: number; lon: number } {
  let totalWeight = 0;
  let weightedLat = 0;
  let weightedLon = 0;
  for (const source of sources) {
    const accuracyWeight = 1 / Math.max(source.accuracy, 1);
    const timeWeight = Math.exp(-(Date.now() - source.timestamp) / 60000);
    const weight = accuracyWeight * source.confidence * timeWeight;
    weightedLat += source.latitude * weight;
    weightedLon += source.longitude * weight;
    totalWeight += weight;
  }
  return {
    lat: weightedLat / totalWeight,
    lon: weightedLon / totalWeight
  };
}

// Calculate weighted centroid of multiple positions (with outlier rejection)
function calculateWeightedCentroid(sources: PositionSource[]): { lat: number; lon: number } {
  const filtered = filterOutliers(sources);
  return calculateWeightedCentroidRaw(filtered);
}
  
  // Perform trilateration using three or more position sources
  function performTrilateration(sources: PositionSource[]): { lat: number; lon: number } | null {
    if (sources.length < 3) {
      return null;
    }
  
    // Use the three most accurate sources
    const sortedSources = sources
      .sort((a, b) => (a.accuracy * (1 - a.confidence)) - (b.accuracy * (1 - b.confidence)))
      .slice(0, 3);
  
    const [p1, p2, p3] = sortedSources;
  
    // Convert to Cartesian coordinates
    const x1 = EARTH_RADIUS * Math.cos(toRadians(p1.latitude)) * Math.cos(toRadians(p1.longitude));
    const y1 = EARTH_RADIUS * Math.cos(toRadians(p1.latitude)) * Math.sin(toRadians(p1.longitude));
    
    const x2 = EARTH_RADIUS * Math.cos(toRadians(p2.latitude)) * Math.cos(toRadians(p2.longitude));
    const y2 = EARTH_RADIUS * Math.cos(toRadians(p2.latitude)) * Math.sin(toRadians(p2.longitude));
    
    const x3 = EARTH_RADIUS * Math.cos(toRadians(p3.latitude)) * Math.cos(toRadians(p3.longitude));
    const y3 = EARTH_RADIUS * Math.cos(toRadians(p3.latitude)) * Math.sin(toRadians(p3.longitude));
  
    // Solve the trilateration equations
    const A = 2 * (x2 - x1);
    const B = 2 * (y2 - y1);
    const C = Math.pow(p1.accuracy, 2) - Math.pow(p2.accuracy, 2) - Math.pow(x1, 2) + Math.pow(x2, 2) - Math.pow(y1, 2) + Math.pow(y2, 2);
    
    const D = 2 * (x3 - x2);
    const E = 2 * (y3 - y2);
    const F = Math.pow(p2.accuracy, 2) - Math.pow(p3.accuracy, 2) - Math.pow(x2, 2) + Math.pow(x3, 2) - Math.pow(y2, 2) + Math.pow(y3, 2);
  
    const denominator = A * E - B * D;
    if (Math.abs(denominator) < 0.000001) {
      // Points are collinear, fall back to weighted average
      return null;
    }
  
    const x = (C * E - F * B) / denominator;
    const y = (A * F - D * C) / denominator;
  
    // Convert back to latitude/longitude
    const lat = toDegrees(Math.asin(Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)) / EARTH_RADIUS));
    const lon = toDegrees(Math.atan2(y, x));
  
    return { lat, lon };
  }
  
  // Main triangulation function
export function triangulatePosition(sources: PositionSource[]): TriangulatedPosition {
  if (sources.length === 0) {
    // Fallback: No sources at all
    return {
      latitude: 0,
      longitude: 0,
      accuracy: 99999,
      confidence: 0,
      sources: [],
      method: 'single',
    };
  }

  // Filter out invalid or very old sources (older than 5 minutes)
  const validSources = sources.filter(source => 
    source.latitude >= -90 && source.latitude <= 90 &&
    source.longitude >= -180 && source.longitude <= 180 &&
    source.accuracy > 0 &&
    (Date.now() - source.timestamp) < 300000 // 5 minutes
  );

  if (validSources.length === 0) {
    // Fallback: Use last known good source if available
    const last = sources[sources.length - 1];
    return {
      latitude: last?.latitude ?? 0,
      longitude: last?.longitude ?? 0,
      accuracy: last?.accuracy ?? 99999,
      confidence: 0.1,
      sources: last ? [last] : [],
      method: 'single',
    };
  }

  // Single source - return as is
  if (validSources.length === 1) {
    const source = validSources[0];
    return {
      latitude: source.latitude,
      longitude: source.longitude,
      accuracy: source.accuracy,
      confidence: source.confidence,
      sources: validSources,
      method: 'single',
    };
  }

  // Try trilateration first if we have 3+ sources
  let position: { lat: number; lon: number } | null = null;
  let method: 'weighted_average' | 'triangulation' = 'weighted_average';

  if (validSources.length >= 3) {
    position = performTrilateration(validSources);
    if (position) {
      method = 'triangulation';
    }
  }

  // Fall back to weighted centroid
  if (!position) {
    position = calculateWeightedCentroid(validSources);
  }

  // Calculate overall accuracy and confidence
  const accuracies = validSources.map(s => s.accuracy);
  const confidences = validSources.map(s => s.confidence);
  const averageAccuracy = accuracies.reduce((a, b) => a + b, 0) / accuracies.length;
  const maxConfidence = Math.max(...confidences);
  const sourceVariance = calculatePositionVariance(validSources);
  // Adjust confidence based on source agreement
  const adjustedConfidence = maxConfidence * Math.exp(-sourceVariance / 1000);

  return {
    latitude: position.lat,
    longitude: position.lon,
    accuracy: Math.max(averageAccuracy * 0.8, 10),
    confidence: Math.min(adjustedConfidence, 1),
    sources: validSources,
    method,
  };
}
  
  // Calculate variance in position estimates
  function calculatePositionVariance(sources: PositionSource[]): number {
    if (sources.length < 2) return 0;
  
    const centroid = calculateWeightedCentroid(sources);
    const distances = sources.map(source => 
      calculateDistance(source.latitude, source.longitude, centroid.lat, centroid.lon)
    );
  
    const meanDistance = distances.reduce((a, b) => a + b, 0) / distances.length;
    const variance = distances.reduce((acc, dist) => acc + Math.pow(dist - meanDistance, 2), 0) / distances.length;
    
    return Math.sqrt(variance);
  }
  
// Get confidence score based on source type, accuracy, age, and source agreement
export function getSourceConfidence(
  sourceType: PositionSource['source'],
  accuracy: number,
  timestamp?: number,
  sourceVariance?: number
): number {
  const baseConfidence = {
    gps: 0.95,
    network: 0.8,
    wifi: 0.75,
    cellular: 0.6,
    ip: 0.3
  };
  const base = baseConfidence[sourceType] || 0.5;
  // Adjust based on accuracy (better accuracy = higher confidence)
  const accuracyFactor = Math.exp(-accuracy / 100);
  // Adjust based on age (older = less confidence)
  let ageFactor = 1;
  if (timestamp) {
    const ageMs = Date.now() - timestamp;
    ageFactor = Math.exp(-ageMs / 120000); // 2 min half-life
  }
  // Adjust based on source agreement (higher variance = less confidence)
  let varianceFactor = 1;
  if (typeof sourceVariance === 'number') {
    varianceFactor = Math.exp(-sourceVariance / 1000);
  }
  // Combine all factors
  const confidence = base * (0.5 + 0.5 * accuracyFactor) * ageFactor * varianceFactor;
  return Math.min(confidence, 1);
}