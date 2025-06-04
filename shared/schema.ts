import { relations } from "drizzle-orm";
import { boolean, int, mysqlEnum, mysqlTable, text, timestamp } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const propertyStatusEnum = mysqlEnum('property_status', ['sale', 'rent']);
export const propertyCategoryEnum = mysqlEnum('property_category', ['residential', 'commercial']);
export const propertyTypeEnum = mysqlEnum('property_type', ['apartment', 'independent-house', 'villa', 'farm-house', 'shop', 'basement']);
export const propertySubTypeEnum = mysqlEnum('property_sub_type', ['1rk', '1bhk', '2bhk', '3bhk', '4bhk', 'plot', 'other']);
export const areaUnitEnum = mysqlEnum('area_unit', ['sq-ft', 'sq-mt', 'sq-yd']);
export const furnishedStatusEnum = mysqlEnum('furnished_status', ['furnished', 'semi-furnished', 'unfurnished']);
export const facingEnum = mysqlEnum('facing', ['east', 'west', 'north', 'south', 'road', 'park', 'greenery']);
export const parkingEnum = mysqlEnum('parking', ['car', 'two-wheeler', 'both', 'none']);
export const portionEnum = mysqlEnum('portion', ['front', 'back', 'side', 'floor']);
export const mediaTypeEnum = mysqlEnum('media_type', ['image', 'video']);
export const inquiryStatusEnum = mysqlEnum('inquiry_status', ['new', 'contacted', 'resolved']);
export const facilityTypeEnum = mysqlEnum('facility_type', ['school', 'hospital', 'market', 'park', 'metro', 'bus-stop', 'bank', 'atm', 'restaurant', 'gym', 'temple', 'mall', 'gas-station', 'other']);

// Users table
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  username: text("username").notNull(),
  email: text("email").notNull(),
  password: text("password").notNull(),
  role: text("role").notNull().default("admin"),
});

// Properties table
export const properties = mysqlTable("properties", {
  id: int("id").autoincrement().primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull(),
  description: text("description").notNull(),
  status: mysqlEnum("status", ['sale', 'rent']).notNull(), // sale/rent
  category: mysqlEnum("category", ['residential', 'commercial']).notNull(), // residential/commercial
  propertyType: mysqlEnum("property_type", ['apartment', 'independent-house', 'villa', 'farm-house', 'shop', 'basement']).notNull(),
  subType: mysqlEnum("sub_type", ['1rk', '1bhk', '2bhk', '3bhk', '4bhk', 'plot', 'other']),
  portion: mysqlEnum("property_portion", ['front', 'back', 'side', 'floor']),
  area: int("area").notNull(),
  areaUnit: mysqlEnum("area_unit", ['sq-ft', 'sq-mt', 'sq-yd']).notNull(),
  furnishedStatus: mysqlEnum("furnished_status", ['furnished', 'semi-furnished', 'unfurnished']),
  bedrooms: int("bedrooms"),
  bathrooms: int("bathrooms"),
  balconies: int("balconies"),
  facing: mysqlEnum("facing", ['east', 'west', 'north', 'south', 'road', 'park', 'greenery']),
  parking: mysqlEnum("parking", ['car', 'two-wheeler', 'both', 'none']),
  age: int("age"),
  price: int("price").notNull(),
  priceNegotiable: boolean("price_negotiable").default(false),
  brokerage: text("brokerage"),
  contactDetails: text("contact_details").notNull(),
  latitude: text("latitude"),
  longitude: text("longitude"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// Property Media table
export const propertyMedia = mysqlTable("property_media", {
  id: int("id").autoincrement().primaryKey(),
  propertyId: int("property_id").notNull().references(() => properties.id, { onDelete: 'cascade' }),
  mediaType: mysqlEnum("media_type", ['image', 'video']).notNull(),
  cloudinaryId: text("cloudinary_id").notNull(),
  cloudinaryUrl: text("cloudinary_url").notNull(),
  isFeatured: boolean("is_featured").default(false),
  orderIndex: int("order_index").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Nearby Facilities table
export const nearbyFacilities = mysqlTable("nearby_facilities", {
  id: int("id").autoincrement().primaryKey(),
  propertyId: int("property_id").notNull().references(() => properties.id, { onDelete: 'cascade' }),
  facilityName: text("facility_name").notNull(),
  distance: text("distance").notNull(), // Stored as text (e.g., "2.5 km")
  distanceValue: int("distance_value"), // Numeric value in meters for calculations
  facilityType: mysqlEnum("facility_type", ['school', 'hospital', 'market', 'park', 'metro', 'bus-stop', 'bank', 'atm', 'restaurant', 'gym', 'temple', 'mall', 'gas-station', 'other']).notNull(),
  latitude: text("latitude"), // For map display
  longitude: text("longitude"), // For map display
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// Inquiries table
export const inquiries = mysqlTable("inquiries", {
  id: int("id").autoincrement().primaryKey(),
  propertyId: int("property_id").references(() => properties.id),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  message: text("message").notNull(),
  status: mysqlEnum("status", ['new', 'contacted', 'resolved']).default("new").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// Relations
export const propertiesRelations = relations(properties, ({ many }) => ({
  media: many(propertyMedia),
  facilities: many(nearbyFacilities),
  inquiries: many(inquiries),
}));

export const propertyMediaRelations = relations(propertyMedia, ({ one }) => ({
  property: one(properties, {
    fields: [propertyMedia.propertyId],
    references: [properties.id],
  }),
}));

export const nearbyFacilitiesRelations = relations(nearbyFacilities, ({ one }) => ({
  property: one(properties, {
    fields: [nearbyFacilities.propertyId],
    references: [properties.id],
  }),
}));

export const inquiriesRelations = relations(inquiries, ({ one }) => ({
  property: one(properties, {
    fields: [inquiries.propertyId],
    references: [properties.id],
  }),
}));

// Schemas for insertion
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
  createdAt: true, 
  updatedAt: true
});

export const insertPropertyMediaSchema = createInsertSchema(propertyMedia).omit({
  id: true,
  createdAt: true
});

export const insertNearbyFacilitySchema = createInsertSchema(nearbyFacilities).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertInquirySchema = createInsertSchema(inquiries).omit({
  id: true,
  status: true,
  createdAt: true,
  updatedAt: true
});

// Types for insertion
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type InsertPropertyMedia = z.infer<typeof insertPropertyMediaSchema>;
export type InsertNearbyFacility = z.infer<typeof insertNearbyFacilitySchema>;
export type InsertInquiry = z.infer<typeof insertInquirySchema>;

// Types for selection
export type User = typeof users.$inferSelect;
export type Property = typeof properties.$inferSelect;
export type PropertyMedia = typeof propertyMedia.$inferSelect;
export type NearbyFacility = typeof nearbyFacilities.$inferSelect;
export type Inquiry = typeof inquiries.$inferSelect;

// Extended types with relations
export type PropertyWithRelations = Property & {
  media?: PropertyMedia[];
  facilities?: NearbyFacility[];
  inquiries?: Inquiry[];
};