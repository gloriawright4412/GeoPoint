import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isAdmin } from "./replitAuth";
import {
  deviceRegistrationSchema,
  locationUpdateSchema,
  adminSearchSchema,
  type User,
  type Device,
  type LocationTracking,
} from "@shared/schema";

// Utility functions for device fingerprinting and IP analysis
function generateDeviceFingerprint(req: any, deviceData: any): string {
  const components = [
    deviceData.userAgent,
    deviceData.screenResolution,
    deviceData.timezone,
    deviceData.language,
    req.ip,
  ].filter(Boolean);
  
  return Buffer.from(components.join('|')).toString('base64').slice(0, 32);
}

async function getClientIP(req: any): Promise<string> {
  return req.ip || 
         req.connection?.remoteAddress || 
         req.socket?.remoteAddress || 
         req.headers['x-forwarded-for']?.split(',')[0] || 
         'unknown';
}

async function enhancedIpLookup(ip: string): Promise<any> {
  try {
    // Try ipapi.co first (more detailed)
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    if (response.ok) {
      const data = await response.json();
      if (!data.error) {
        return {
          ip: data.ip,
          country: data.country_name,
          countryCode: data.country_code,
          region: data.region,
          regionCode: data.region_code,
          city: data.city,
          zipCode: data.postal,
          latitude: data.latitude,
          longitude: data.longitude,
          isp: data.org,
          ispOrg: data.org,
          asn: data.asn,
          timezone: data.timezone,
          isProxy: false,
          isVpn: false,
          isTor: false,
          threatLevel: 'low',
        };
      }
    }

    // Fallback to ip-api.com
    const fallbackResponse = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,continent,continentCode,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,proxy,hosting`);
    if (fallbackResponse.ok) {
      const fallbackData = await fallbackResponse.json();
      if (fallbackData.status === 'success') {
        return {
          ip,
          country: fallbackData.country,
          countryCode: fallbackData.countryCode,
          region: fallbackData.regionName,
          regionCode: fallbackData.region,
          city: fallbackData.city,
          zipCode: fallbackData.zip,
          latitude: fallbackData.lat,
          longitude: fallbackData.lon,
          isp: fallbackData.isp,
          ispOrg: fallbackData.org,
          asn: fallbackData.as,
          timezone: fallbackData.timezone,
          isProxy: fallbackData.proxy || false,
          isVpn: fallbackData.hosting || false,
          isTor: false,
          threatLevel: fallbackData.proxy ? 'medium' : 'low',
        };
      }
    }

    return null;
  } catch (error) {
    console.error('IP lookup failed:', error);
    return null;
  }
}

// Admin middleware
const isAdmin: RequestHandler = async (req: any, res, next) => {
  const user = req.user;
  if (!user || !user.claims?.isAdmin) {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user) {
        // Update last login time
        await storage.upsertUser({
          ...user,
          lastLoginAt: new Date(),
        });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Device registration and tracking
  app.post('/api/device/register', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const deviceData = deviceRegistrationSchema.parse(req.body);
      const clientIP = await getClientIP(req);
      
      // Generate or use provided device fingerprint
      const fingerprint = deviceData.deviceFingerprint || generateDeviceFingerprint(req, deviceData);
      
      // Provide safe defaults for all required fields
      const sanitizedDeviceData = {
        ...deviceData,
        userId,
        deviceFingerprint: fingerprint,
        ipAddress: clientIP,
        deviceType: deviceData.deviceType || 'unknown',
        platform: deviceData.platform || 'unknown', 
        browser: deviceData.browser || 'unknown',
        browserVersion: deviceData.browserVersion || 'unknown',
        userAgent: deviceData.userAgent || req.headers['user-agent'] || '',
        screenResolution: deviceData.screenResolution || 'unknown',
        timezone: deviceData.timezone || 'UTC',
        language: deviceData.language || 'en',
        osVersion: deviceData.osVersion || 'unknown',
        appVersion: deviceData.appVersion || '1.0.0',
      };

      // Register or update device
      const device = await storage.registerDevice(sanitizedDeviceData);

      // Log IP information
      const ipData = await enhancedIpLookup(clientIP);
      if (ipData) {
        await storage.upsertIpTracking(ipData);
      }

      res.json({ 
        device,
        fingerprint,
        ipAddress: clientIP 
      });
    } catch (error) {
      console.error('Device registration error:', error);
      res.status(500).json({ error: 'Failed to register device' });
    }
  });

  // Real-time location tracking
  app.post('/api/location/track', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const locationData = locationUpdateSchema.parse(req.body);
      const clientIP = await getClientIP(req);
      
      // Get or create device for this session
      const deviceFingerprint = req.headers['device-fingerprint'] || generateDeviceFingerprint(req, {
        userAgent: req.headers['user-agent'],
        screenResolution: req.headers['screen-resolution'],
        timezone: req.headers['timezone'],
        language: req.headers['accept-language'],
      });

      let device = await storage.getDeviceByFingerprint(deviceFingerprint);
      if (!device) {
        device = await storage.registerDevice({
          userId,
          deviceFingerprint,
          deviceType: req.headers['device-type'] || 'unknown',
          platform: req.headers['platform'] || 'unknown',
          browser: 'unknown',
          browserVersion: 'unknown',
          userAgent: req.headers['user-agent'] || '',
          screenResolution: 'unknown',
          timezone: 'UTC',
          language: 'en',
          ipAddress: clientIP,
          osVersion: 'unknown',
          appVersion: '1.0.0',
        });
      }

      // Reverse geocode coordinates to get address
      let addressData: any = {};
      try {
        const geocodeResponse = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${locationData.latitude}&lon=${locationData.longitude}&addressdetails=1`
        );
        if (geocodeResponse.ok) {
          const geocodeData = await geocodeResponse.json();
          if (geocodeData && !geocodeData.error) {
            addressData = {
              address: geocodeData.display_name,
              street: geocodeData.address?.road || '',
              city: geocodeData.address?.city || geocodeData.address?.town || geocodeData.address?.village || '',
              state: geocodeData.address?.state || '',
              country: geocodeData.address?.country || '',
              zipCode: geocodeData.address?.postcode || '',
            };
          }
        }
      } catch (geocodeError) {
        console.error('Geocoding failed:', geocodeError);
      }

      // Enhanced IP lookup
      const ipData = await enhancedIpLookup(clientIP);
      if (ipData) {
        await storage.upsertIpTracking(ipData);
      }

      // Create location record
      const locationRecord = await storage.createLocationRecord({
        userId,
        deviceId: device.id,
        sessionId: req.sessionID,
        latitude: locationData.latitude.toString(),
        longitude: locationData.longitude.toString(),
        accuracy: locationData.accuracy?.toString(),
        altitude: locationData.altitude?.toString(),
        speed: locationData.speed?.toString(),
        heading: locationData.heading?.toString(),
        ipAddress: clientIP,
        isp: ipData?.isp,
        ispOrg: ipData?.ispOrg,
        timezone: ipData?.timezone,
        trackingMethod: locationData.trackingMethod || 'gps',
        ...addressData,
      });

      // Broadcast to WebSocket clients (if connected)
      broadcastLocationUpdate(locationRecord);

      res.json({
        success: true,
        location: locationRecord,
        device,
        ipInfo: ipData,
      });
    } catch (error) {
      console.error('Location tracking error:', error);
      res.status(500).json({ error: 'Failed to track location' });
    }
  });

  // Get user's devices
  app.get('/api/user/devices', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const devices = await storage.getUserDevices(userId);
      res.json(devices);
    } catch (error) {
      console.error('Get devices error:', error);
      res.status(500).json({ error: 'Failed to get devices' });
    }
  });

  // Get user's location history
  app.get('/api/user/locations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 100;
      const locations = await storage.getUserLocationHistory(userId, limit);
      res.json(locations);
    } catch (error) {
      console.error('Get locations error:', error);
      res.status(500).json({ error: 'Failed to get locations' });
    }
  });

  // User stats
  app.get('/api/user/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error('Get user stats error:', error);
      res.status(500).json({ error: 'Failed to get user stats' });
    }
  });

  // Public IP lookup (for anonymous users)
  app.post('/api/ip-lookup', async (req, res) => {
    try {
      const { ip } = req.body;
      const targetIp = ip || await getClientIP(req);
      
      const ipData = await enhancedIpLookup(targetIp);
      if (!ipData) {
        return res.status(404).json({ error: 'IP information not found' });
      }

      // Store IP data
      await storage.upsertIpTracking(ipData);
      
      res.json({
        coordinates: {
          latitude: ipData.latitude,
          longitude: ipData.longitude,
        },
        ipInfo: {
          ip: ipData.ip,
          isp: ipData.isp,
          timezone: ipData.timezone,
          country: ipData.country,
          region: ipData.region,
          city: ipData.city,
        },
        security: {
          isProxy: ipData.isProxy,
          isVpn: ipData.isVpn,
          isTor: ipData.isTor,
          threatLevel: ipData.threatLevel,
        }
      });
    } catch (error) {
      console.error('IP lookup error:', error);
      res.status(500).json({ error: 'Failed to lookup IP address' });
    }
  });

  // Admin routes (protected)
  app.get('/api/admin/stats', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const stats = await storage.getSystemStats();
      res.json(stats);
    } catch (error) {
      console.error('Admin stats error:', error);
      res.status(500).json({ error: 'Failed to get system stats' });
    }
  });

  app.get('/api/admin/users', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const users = await storage.getAllUsers(limit, offset);
      res.json(users);
    } catch (error) {
      console.error('Admin get users error:', error);
      res.status(500).json({ error: 'Failed to get users' });
    }
  });

  app.get('/api/admin/devices', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const devices = await storage.getAllDevices(limit, offset);
      res.json(devices);
    } catch (error) {
      console.error('Admin get devices error:', error);
      res.status(500).json({ error: 'Failed to get devices' });
    }
  });

  app.get('/api/admin/locations/realtime', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const locations = await storage.getRealtimeLocations();
      res.json(locations);
    } catch (error) {
      console.error('Admin get realtime locations error:', error);
      res.status(500).json({ error: 'Failed to get realtime locations' });
    }
  });

  app.post('/api/admin/search', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const searchParams = adminSearchSchema.parse(req.body);
      let results: any = {};

      if (!searchParams.type || searchParams.type === 'user') {
        results.users = searchParams.query ? 
          await storage.searchUsers(searchParams.query) : 
          await storage.getAllUsers(searchParams.limit, searchParams.offset);
      }

      if (!searchParams.type || searchParams.type === 'device') {
        results.devices = searchParams.query ? 
          await storage.searchDevices(searchParams.query) : 
          await storage.getAllDevices(searchParams.limit, searchParams.offset);
      }

      res.json(results);
    } catch (error) {
      console.error('Admin search error:', error);
      res.status(500).json({ error: 'Failed to search' });
    }
  });

  // Legacy geocoding endpoints (for backward compatibility)
  app.post("/api/geocode", async (req, res) => {
    try {
      const { address } = req.body;
      const encodedAddress = encodeURIComponent(address);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&addressdetails=1`
      );
      
      if (!response.ok) {
        throw new Error("Geocoding service unavailable");
      }
      
      const data = await response.json();
      
      if (!data || data.length === 0) {
        return res.status(404).json({ error: "Address not found" });
      }
      
      const result = data[0];
      
      res.json({
        coordinates: {
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon),
        },
        address: {
          street: result.display_name.split(",")[0] || "",
          city: result.address?.city || result.address?.town || result.address?.village || "",
          state: result.address?.state || "",
          zipCode: result.address?.postcode || "",
          country: result.address?.country || "",
          formattedAddress: result.display_name,
        }
      });
    } catch (error) {
      console.error("Geocoding error:", error);
      res.status(500).json({ error: "Failed to geocode address" });
    }
  });

  app.post("/api/reverse-geocode", async (req, res) => {
    try {
      const { latitude, longitude } = req.body;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
      );
      
      if (!response.ok) {
        throw new Error("Reverse geocoding service unavailable");
      }
      
      const data = await response.json();
      
      if (!data || data.error) {
        return res.status(404).json({ error: "Location not found" });
      }
      
      res.json({
        address: {
          street: data.address?.road || data.address?.pedestrian || "",
          city: data.address?.city || data.address?.town || data.address?.village || "",
          state: data.address?.state || "",
          zipCode: data.address?.postcode || "",
          country: data.address?.country || "",
          formattedAddress: data.display_name,
        }
      });
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      res.status(500).json({ error: "Failed to reverse geocode coordinates" });
    }
  });

  const httpServer = createServer(app);
  
  // WebSocket setup for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws: WebSocket, req) => {
    console.log('WebSocket client connected');
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        // Handle WebSocket messages (future implementation)
        console.log('WebSocket message:', data);
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  // Function to broadcast location updates to connected clients
  function broadcastLocationUpdate(locationData: any) {
    const message = JSON.stringify({
      type: 'locationUpdate',
      data: locationData,
    });

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  return httpServer;
}
