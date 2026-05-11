import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const storesTable = pgTable("stores", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  coverImage: text("cover_image"),
  logoImage: text("logo_image"),
  primaryColor: text("primary_color").notNull().default("#C1121F"),
  secondaryColor: text("secondary_color").default("#F3F4F6"),
  fontFamily: text("font_family").default("Poppins"),
  currencies: text("currencies").default('["USD","SAR","YER"]'),
  defaultCurrency: text("default_currency").default("USD"),
  themeConfig: text("theme_config"),
  whatsappNumber: text("whatsapp_number").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertStoreSchema = createInsertSchema(storesTable).omit({ id: true, createdAt: true });
export type InsertStore = z.infer<typeof insertStoreSchema>;
export type Store = typeof storesTable.$inferSelect;
