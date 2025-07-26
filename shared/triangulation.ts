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
  
  // Calculate weighted centroid of multiple positions
  function calculateWeightedCentroid(sources: PositionSource[]): { lat: number; lon: number } {
    let totalWeight = 0;
    let weightedLat = 0;
    let weightedLon = 0;
  
    for (const source of sources) {
      // Weight based on accuracy (smaller accuracy = higher weight) and confidence
      const accuracyWeight = 1 / Math.max(source.accuracy, 1);
      const timeWeight = Math.exp(-(Date.now() - source.timestamp) / 60000); // Decay over 1 minute
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
      throw new Error('No position sources provided');
    }
  
    // Filter out invalid or very old sources (older than 5 minutes)
    const validSources = sources.filter(source => 
      source.latitude >= -90 && source.latitude <= 90 &&
      source.longitude >= -180 && source.longitude <= 180 &&
      source.accuracy > 0 &&
      (Date.now() - source.timestamp) < 300000 // 5 minutes
    );
  
    if (validSources.length === 0) {
      throw new Error('No valid position sources');
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
        method: 'single'
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
    const adjustedConfidence = maxConfidence * Math.exp(-sourceVariance / 1000); // Reduce confidence if sources disagree
  
    return {
      latitude: position.lat,
      longitude: position.lon,
      accuracy: Math.max(averageAccuracy * 0.8, 10), // Assume triangulation improves accuracy
      confidence: Math.min(adjustedConfidence, 1),
      sources: validSources,
      method
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
  
  // Get confidence score based on source type
  export function getSourceConfidence(sourceType: PositionSource['source'], accuracy: number): number {
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
    
    return Math.min(base * (0.5 + 0.5 * accuracyFactor), 1);
  }