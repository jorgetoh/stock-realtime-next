import { users } from "@/database/auth-schema";
export * from "@/database/auth-schema";

import {
  pgTable,
  text,
  integer,
  timestamp,
  boolean,
  decimal,
  uuid,
} from "drizzle-orm/pg-core";

export const userBalances = pgTable("user_balances", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  usdBalance: decimal("usd_balance", { precision: 10, scale: 2 })
    .notNull()
    .default("100000.00"),
  btcBalance: decimal("btc_balance", { precision: 18, scale: 8 })
    .notNull()
    .default("1.00000000"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text({ enum: ["BUY", "SELL"] }).notNull(),
  status: text({ enum: ["PENDING", "COMPLETED", "CANCELLED"] }).notNull(),
  amount: decimal("amount", { precision: 18, scale: 8 }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }),
  totalValue: decimal("total_value", { precision: 10, scale: 2 }).notNull(),
  isMarketOrder: boolean("is_market_order").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});
