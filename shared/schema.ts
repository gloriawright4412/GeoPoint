import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  boolean,
  decimal,
  integer,
  serial,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table for authentication and tracking
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  isAdmin: boolean("is_admin").default(false),
  isActive: boolean("is_active").default(true),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Devices table for comprehensive device tracking
export const devices = pgTable("devices", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  deviceFingerprint: varchar("device_fingerprint").notNull().unique(),
  deviceType: varchar("device_type"), // mobile, desktop, tablet
  platform: varchar("platform"), // iOS, Android, Windows, macOS, Linux
  browser: varchar("browser"),
  browserVersion: varchar("browser_version"),
  userAgent: text("user_agent"),
  screenResolution: varchar("screen_resolution"),
  timezone: varchar("timezone"),
  language: varchar("language"),
  ipAddress: varchar("ip_address"),
  macAddress: varchar("mac_address"),
  imei: varchar("imei"),
  deviceModel: varchar("device_model"),
  osVersion: varchar("os_version"),
  appVersion: varchar("app_version"),
  isActive: boolean("is_active").default(true),
  firstSeenAt: timestamp("first_seen_at").defaultNow(),
  lastSeenAt: timestamp("last_seen_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("devices_user_id_idx").on(table.userId),
  index("devices_fingerprint_idx").on(table.deviceFingerprint),
  index("devices_ip_idx").on(table.ipAddress),
  index("devices_mac_idx").on(table.macAddress),
  index("devices_imei_idx").on(table.imei),
]);

// Location tracking table for real-time and historical data
export const locationTracking = pgTable("location_tracking", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  deviceId: integer("device_id").references(() => devices.id),
  sessionId: varchar("session_id"),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  accuracy: decimal("accuracy", { precision: 10, scale: 2 }),
  altitude: decimal("altitude", { precision: 10, scale: 2 }),
  speed: decimal("speed", { precision: 8, scale: 2 }),
  heading: decimal("heading", { precision: 6, scale: 2 }),
  address: text("address"),
  street: varchar("street"),
  city: varchar("city"),
  state: varchar("state"),
  country: varchar("country"),
  zipCode: varchar("zip_code"),
  ipAddress: varchar("ip_address").notNull(),
  isp: varchar("isp"),
  ispOrg: varchar("isp_org"),
  timezone: varchar("timezone"),
  isRealtime: boolean("is_realtime").default(true),
  trackingMethod: varchar("tracking_method"), // gps, network, ip, manual
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("location_user_id_idx").on(table.userId),
  index("location_device_id_idx").on(table.deviceId),
  index("location_created_at_idx").on(table.createdAt),
  index("location_realtime_idx").on(table.isRealtime),
]);

// IP tracking for detailed network analysis
export const ipTracking = pgTable("ip_tracking", {
  id: serial("id").primaryKey(),
  ipAddress: varchar("ip_address").notNull().unique(),
  country: varchar("country"),
  countryCode: varchar("country_code"),
  region: varchar("region"),
  regionCode: varchar("region_code"),
  city: varchar("city"),
  zipCode: varchar("zip_code"),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  isp: varchar("isp"),
  ispOrg: varchar("isp_org"),
  asn: varchar("asn"),
  timezone: varchar("timezone"),
  isProxy: boolean("is_proxy").default(false),
  isVpn: boolean("is_vpn").default(false),
  isTor: boolean("is_tor").default(false),
  threatLevel: varchar("threat_level"),
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),

isRealtime: boolean("is_realtime").default(true),
  trackingMethod: varchar("tracking_method"), // gps, network, ip, manual, triangulated_single, triangulated_weighted_average, triangulated_triangulation
  triangulationConfidence: decimal("triangulation_confidence", { precision: 5, scale: 4 }),
  sourcesUsed: integer("sources_used"),
  
}, (table) => [
  index("ip_tracking_ip_idx").on(table.ipAddress),
  index("ip_tracking_country_idx").on(table.country),
  index("location_user_id_idx").on(table.userId),
  index("location_device_id_idx").on(table.deviceId),
  index("location_created_at_idx").on(table.createdAt),
  index("location_realtime_idx").on(table.isRealtime),
]);

// Admin activities tracking
export const adminActivities = pgTable("admin_activities", {
  id: serial("id").primaryKey(),
  adminUserId: varchar("admin_user_id").references(() => users.id),
  action: varchar("action").notNull(),
  targetType: varchar("target_type"), // user, device, location, system
  targetId: varchar("target_id"),
  details: jsonb("details"),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
  
}, (table) => [
  index("admin_activities_admin_idx").on(table.adminUserId),
  index("admin_activities_action_idx").on(table.action),
  index("admin_activities_created_at_idx").on(table.createdAt),
]);



// Create Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDeviceSchema = createInsertSchema(devices).omit({ id: true, createdAt: true, updatedAt: true });
export const insertLocationTrackingSchema = createInsertSchema(locationTracking).omit({ id: true, createdAt: true });
export const insertIpTrackingSchema = createInsertSchema(ipTracking).omit({ id: true, createdAt: true, lastUpdated: true });
export const insertAdminActivitySchema = createInsertSchema(adminActivities).omit({ id: true, createdAt: true });

// API request/response schemas
export const deviceRegistrationSchema = z.object({
  deviceFingerprint: z.string().optional(),
  deviceType: z.string().optional(),
  platform: z.string().optional(), 
  browser: z.string().optional(),
  browserVersion: z.string().optional(),
  userAgent: z.string().optional(),
  screenResolution: z.string().optional(),
  timezone: z.string().optional(),
  language: z.string().optional(),
  macAddress: z.string().optional(),
  imei: z.string().optional(),
  deviceModel: z.string().optional(),
  osVersion: z.string().optional(),
  appVersion: z.string().optional(),
});

export const locationUpdateSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  accuracy: z.number().optional(),
  altitude: z.number().optional(),
  speed: z.number().optional(),
  heading: z.number().optional(),
  trackingMethod: z.string().optional(),
  triangulationMethod: z.string().optional(),
  triangulationConfidence: z.number().optional(),
  sourcesUsed: z.number().optional(),
});

export const adminSearchSchema = z.object({
  query: z.string().optional(),
  type: z.enum(['user', 'device', 'location', 'ip']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.number().default(50),
  offset: z.number().default(0),
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = typeof users.$inferInsert;

export type Device = typeof devices.$inferSelect;
export type InsertDevice = z.infer<typeof insertDeviceSchema>;

export type LocationTracking = typeof locationTracking.$inferSelect;
export type InsertLocationTracking = z.infer<typeof insertLocationTrackingSchema>;

export type IpTracking = typeof ipTracking.$inferSelect;
export type InsertIpTracking = z.infer<typeof insertIpTrackingSchema>;

export type AdminActivity = typeof adminActivities.$inferSelect;
export type InsertAdminActivity = z.infer<typeof insertAdminActivitySchema>;

export type DeviceRegistration = z.infer<typeof deviceRegistrationSchema>;
export type LocationUpdate = z.infer<typeof locationUpdateSchema>;
export type AdminSearch = z.infer<typeof adminSearchSchema>;
