import {
  users,
  devices,
  locationTracking,
  ipTracking,
  adminActivities,
  type User,
  type UpsertUser,
  type Device,
  type InsertDevice,
  type LocationTracking,
  type InsertLocationTracking,
  type IpTracking,
  type InsertIpTracking,
  type AdminActivity,
  type InsertAdminActivity,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, like, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  
  // Device operations
  registerDevice(deviceData: InsertDevice): Promise<Device>;
  getDevice(id: number): Promise<Device | undefined>;
  getDeviceByFingerprint(fingerprint: string): Promise<Device | undefined>;
  getUserDevices(userId: string): Promise<Device[]>;
  updateDevice(id: number, data: Partial<InsertDevice>): Promise<Device>;
  
  // Location tracking operations
  createLocationRecord(data: InsertLocationTracking): Promise<LocationTracking>;
  getUserLocationHistory(userId: string, limit?: number): Promise<LocationTracking[]>;
  getDeviceLocationHistory(deviceId: number, limit?: number): Promise<LocationTracking[]>;
  getRealtimeLocations(): Promise<LocationTracking[]>;
  
  // IP tracking operations
  upsertIpTracking(data: InsertIpTracking): Promise<IpTracking>;
  getIpTracking(ip: string): Promise<IpTracking | undefined>;
  
  // Admin operations
  logAdminActivity(data: InsertAdminActivity): Promise<AdminActivity>;
  getAdminActivities(limit?: number): Promise<AdminActivity[]>;
  getAllUsers(limit?: number, offset?: number): Promise<User[]>;
  getAllDevices(limit?: number, offset?: number): Promise<Device[]>;
  searchUsers(query: string): Promise<User[]>;
  searchDevices(query: string): Promise<Device[]>;
  
  // Analytics operations
  getUserStats(userId: string): Promise<any>;
  getSystemStats(): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          lastLoginAt: new Date(),
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  // Device operations
  async registerDevice(deviceData: InsertDevice): Promise<Device> {
    // First try to find existing device
    const existingDevice = await this.getDeviceByFingerprint(deviceData.deviceFingerprint);
    
    if (existingDevice) {
      // Update existing device
      return await this.updateDevice(existingDevice.id, {
        ...deviceData,
        lastSeenAt: new Date(),
      });
    }
    
    // Create new device
    const [device] = await db
      .insert(devices)
      .values({
        ...deviceData,
        lastSeenAt: new Date(),
      })
      .returning();
    return device;
  }

  async getDevice(id: number): Promise<Device | undefined> {
    const [device] = await db.select().from(devices).where(eq(devices.id, id));
    return device;
  }

  async getDeviceByFingerprint(fingerprint: string): Promise<Device | undefined> {
    const [device] = await db.select().from(devices).where(eq(devices.deviceFingerprint, fingerprint));
    return device;
  }

  async getUserDevices(userId: string): Promise<Device[]> {
    return await db.select().from(devices)
      .where(eq(devices.userId, userId))
      .orderBy(desc(devices.lastSeenAt));
  }

  async updateDevice(id: number, data: Partial<InsertDevice>): Promise<Device> {
    const [device] = await db
      .update(devices)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(devices.id, id))
      .returning();
    return device;
  }

  // Location tracking operations
  async createLocationRecord(data: InsertLocationTracking): Promise<LocationTracking> {
    const [location] = await db.insert(locationTracking).values(data).returning();
    return location;
  }

  async getUserLocationHistory(userId: string, limit = 100): Promise<LocationTracking[]> {
    return await db.select().from(locationTracking)
      .where(eq(locationTracking.userId, userId))
      .orderBy(desc(locationTracking.createdAt))
      .limit(limit);
  }

  async getDeviceLocationHistory(deviceId: number, limit = 100): Promise<LocationTracking[]> {
    return await db.select().from(locationTracking)
      .where(eq(locationTracking.deviceId, deviceId))
      .orderBy(desc(locationTracking.createdAt))
      .limit(limit);
  }

  async getRealtimeLocations(): Promise<LocationTracking[]> {
    return await db.select().from(locationTracking)
      .where(eq(locationTracking.isRealtime, true))
      .orderBy(desc(locationTracking.createdAt))
      .limit(1000);
  }

  // IP tracking operations
  async upsertIpTracking(data: InsertIpTracking): Promise<IpTracking> {
    const [ip] = await db
      .insert(ipTracking)
      .values(data)
      .onConflictDoUpdate({
        target: ipTracking.ipAddress,
        set: {
          ...data,
          lastUpdated: new Date(),
        },
      })
      .returning();
    return ip;
  }

  async getIpTracking(ip: string): Promise<IpTracking | undefined> {
    const [ipData] = await db.select().from(ipTracking).where(eq(ipTracking.ipAddress, ip));
    return ipData;
  }

  // Admin operations
  async logAdminActivity(data: InsertAdminActivity): Promise<AdminActivity> {
    const [activity] = await db.insert(adminActivities).values(data).returning();
    return activity;
  }

  async getAdminActivities(limit = 100): Promise<AdminActivity[]> {
    return await db.select().from(adminActivities)
      .orderBy(desc(adminActivities.createdAt))
      .limit(limit);
  }

  async getAllUsers(limit = 50, offset = 0): Promise<User[]> {
    return await db.select().from(users)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getAllDevices(limit = 50, offset = 0): Promise<Device[]> {
    return await db.select().from(devices)
      .orderBy(desc(devices.lastSeenAt))
      .limit(limit)
      .offset(offset);
  }

  async searchUsers(query: string): Promise<User[]> {
    return await db.select().from(users)
      .where(
        or(
          like(users.email, `%${query}%`),
          like(users.firstName, `%${query}%`),
          like(users.lastName, `%${query}%`)
        )
      )
      .limit(50);
  }

  async searchDevices(query: string): Promise<Device[]> {
    return await db.select().from(devices)
      .where(
        or(
          like(devices.deviceFingerprint, `%${query}%`),
          like(devices.platform, `%${query}%`),
          like(devices.ipAddress, `%${query}%`),
          like(devices.macAddress, `%${query}%`),
          like(devices.imei, `%${query}%`)
        )
      )
      .limit(50);
  }

  // Analytics operations
  async getUserStats(userId: string): Promise<any> {
    const [deviceCount] = await db
      .select({ count: sql`count(*)` })
      .from(devices)
      .where(eq(devices.userId, userId));

    const [locationCount] = await db
      .select({ count: sql`count(*)` })
      .from(locationTracking)
      .where(eq(locationTracking.userId, userId));

    const [lastLocation] = await db.select().from(locationTracking)
      .where(eq(locationTracking.userId, userId))
      .orderBy(desc(locationTracking.createdAt))
      .limit(1);

    return {
      deviceCount: deviceCount.count,
      locationCount: locationCount.count,
      lastLocation,
    };
  }

  async getSystemStats(): Promise<any> {
    const [userCount] = await db.select({ count: sql`count(*)` }).from(users);
    const [deviceCount] = await db.select({ count: sql`count(*)` }).from(devices);
    const [locationCount] = await db.select({ count: sql`count(*)` }).from(locationTracking);
    const [ipCount] = await db.select({ count: sql`count(*)` }).from(ipTracking);

    return {
      totalUsers: userCount.count,
      totalDevices: deviceCount.count,
      totalLocations: locationCount.count,
      totalIPs: ipCount.count,
    };
  }
}

export const storage = new DatabaseStorage();
