import { pgTable, text, timestamp, boolean, integer, json } from "drizzle-orm/pg-core";


export const users = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"), 
  emailVerified: boolean("emailVerified").notNull().default(true), 
  image: text("image"),
  role: text("role", { enum: ["landlord", "agent", "user"] }).notNull().default("user"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const sessions = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

export const accounts = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});


export const verifications = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export const userProfiles = pgTable("user_profile", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  
  // Required fields for landlords and agents
  phoneNumber: text("phoneNumber").notNull(),
  
  // Optional fields
  bio: text("bio"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  
  // Agent-specific fields
  agencyName: text("agencyName"), // For agents: name of their agency
  licenseNumber: text("licenseNumber"), // For agents: professional license number
  
  // Verification status
  isVerified: boolean("isVerified").notNull().default(false),
  
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export type MediaFile = {
  id: string;
  url: string;
  type: "image" | "video";
  name: string;
  featured?: boolean; // For images: mark as featured for property card display
};

export const properties = pgTable("property", {
  id: text("id").primaryKey(),
  type: text("type", { 
    enum: [
      "detached_duplex",
      "semi_detached_duplex", 
      "terrace",
      "flat",
      "apartment",
      "penthouse",
      "bungalow",
      "mansion",
      "mini_flat",
      "room_and_parlour",
      "single_room",
      "shop",
      "office",
      "warehouse",
      "land",
      "event_center",
      "hotel",
      "guest_house"
    ] 
  }).notNull(),
  listingType: text("listingType", { enum: ["rent", "sell"] }).notNull(),
  price: integer("price").notNull(),
  bedrooms: integer("bedrooms"),
  bathrooms: integer("bathrooms"),
  parking: integer("parking"),
  size: text("size").notNull(),
  images: json("images").$type<MediaFile[]>().notNull().default([]), // All property images with featured flag
  videos: json("videos").$type<MediaFile[]>().notNull().default([]), // Property videos
  
  description: text("description").notNull(),
  coordinates: json("coordinates").$type<{ lat: number; lng: number }>(),
  address: text("address"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  
  listedBy: text("listedBy")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const propertyAlerts = pgTable("property_alert", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  
  // Alert criteria
  type: text("type", { 
    enum: [
      "detached_duplex",
      "semi_detached_duplex", 
      "terrace",
      "flat",
      "apartment",
      "penthouse",
      "bungalow",
      "mansion",
      "mini_flat",
      "room_and_parlour",
      "single_room",
      "shop",
      "office",
      "warehouse",
      "land",
      "event_center",
      "hotel",
      "guest_house"
    ] 
  }),
  listingType: text("listingType", { enum: ["rent", "sell"] }),
  minPrice: integer("minPrice"),
  maxPrice: integer("maxPrice"),
  bedrooms: integer("bedrooms"),
  city: text("city"),
  state: text("state"),
  
  // Alert settings
  isActive: boolean("isActive").notNull().default(true),
  notificationMethod: text("notificationMethod", { enum: ["email", "sms", "both"] }).notNull().default("email"),
  
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

// Export types for TypeScript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;

export type Verification = typeof verifications.$inferSelect;
export type NewVerification = typeof verifications.$inferInsert;

export type UserProfile = typeof userProfiles.$inferSelect;
export type NewUserProfile = typeof userProfiles.$inferInsert;

export type Property = typeof properties.$inferSelect;
export type NewProperty = typeof properties.$inferInsert;

export type PropertyAlert = typeof propertyAlerts.$inferSelect;
export type NewPropertyAlert = typeof propertyAlerts.$inferInsert;
