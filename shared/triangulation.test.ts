
import {
  triangulatePosition,
  getSourceConfidence,
  kalmanSmoothPositions,
  smoothWithHistory,
} from './triangulation';

describe('triangulation', () => {
  it('should return correct centroid for multiple sources', () => {
    const now = Date.now();
    const sources = [
      { latitude: 1, longitude: 1, accuracy: 10, source: 'gps' as const, timestamp: now, confidence: 0.9 },
      { latitude: 1, longitude: 2, accuracy: 10, source: 'gps' as const, timestamp: now, confidence: 0.9 },
      { latitude: 2, longitude: 1, accuracy: 10, source: 'gps' as const, timestamp: now, confidence: 0.9 },
    ];
    const result = triangulatePosition(sources);
    expect(result.latitude).toBeGreaterThan(1);
    expect(result.longitude).toBeGreaterThan(1);
  });

  it('should filter outliers', () => {
    const now = Date.now();
    const sources = [
      { latitude: 1, longitude: 1, accuracy: 10, source: 'gps' as const, timestamp: now, confidence: 0.9 },
      { latitude: 1, longitude: 2, accuracy: 10, source: 'gps' as const, timestamp: now, confidence: 0.9 },
      { latitude: 50, longitude: 50, accuracy: 10, source: 'gps' as const, timestamp: now, confidence: 0.9 },
    ];
    const result = triangulatePosition(sources);
    expect(Math.abs(result.latitude - 1)).toBeLessThan(10);
    expect(Math.abs(result.longitude - 1)).toBeLessThan(10);
  });

  it('should fallback gracefully', () => {
    const sources: any[] = [];
    const result = triangulatePosition(sources);
    expect(result.confidence).toBe(0);
  });

  it('should smooth history', () => {
    const history = [
      { lat: 1, lon: 1 },
      { lat: 2, lon: 2 },
      { lat: 3, lon: 3 },
    ];
    const smoothed = smoothWithHistory(history, 2);
    expect(smoothed.lat).toBeCloseTo(2.5);
    expect(smoothed.lon).toBeCloseTo(2.5);
  });

  it('should apply Kalman filter', () => {
    const positions = [
      { lat: 1, lon: 1 },
      { lat: 2, lon: 2 },
      { lat: 3, lon: 3 },
    ];
    const smoothed = kalmanSmoothPositions(positions);
    expect(smoothed.length).toBe(3);
    expect(smoothed[2].lat).toBeGreaterThan(2);
  });

  it('should calculate dynamic confidence', () => {
    const conf = getSourceConfidence('gps', 5, Date.now() - 1000, 10);
    expect(conf).toBeLessThanOrEqual(1);
    expect(conf).toBeGreaterThan(0);
  });
});
