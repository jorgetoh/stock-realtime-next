"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/database/db";
import { orders, userBalances } from "@/database/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createMarketOrder(
  type: "BUY" | "SELL",
  amount: number,
  currentPrice: number
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Not authenticated");
  }

  const totalValue = amount * currentPrice;

  const balances = await db
    .select()
    .from(userBalances)
    .where(eq(userBalances.userId, session.user.id))
    .limit(1);

  if (!balances.length) {
    throw new Error("User balance not found");
  }

  const { usdBalance, btcBalance } = balances[0];

  if (type === "BUY" && parseFloat(usdBalance) < totalValue) {
    throw new Error("Insufficient USD balance");
  }

  if (type === "SELL" && parseFloat(btcBalance) < amount) {
    throw new Error("Insufficient BTC balance");
  }

  await db.insert(orders).values({
    userId: session.user.id,
    type,
    status: "PENDING",
    amount: amount.toString(),
    price: currentPrice.toString(),
    totalValue: totalValue.toString(),
    isMarketOrder: true,
  });

  revalidatePath("/dashboard");
}

export async function createLimitOrder(
  type: "BUY" | "SELL",
  amount: number,
  price: number
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Not authenticated");
  }

  const totalValue = amount * price;

  const balances = await db
    .select()
    .from(userBalances)
    .where(eq(userBalances.userId, session.user.id))
    .limit(1);

  if (!balances.length) {
    throw new Error("User balance not found");
  }

  const { usdBalance, btcBalance } = balances[0];

  if (type === "BUY" && parseFloat(usdBalance) < totalValue) {
    throw new Error("Insufficient USD balance");
  }

  if (type === "SELL" && parseFloat(btcBalance) < amount) {
    throw new Error("Insufficient BTC balance");
  }

  await db.insert(orders).values({
    userId: session.user.id,
    type,
    status: "PENDING",
    amount: amount.toString(),
    price: price.toString(),
    totalValue: totalValue.toString(),
    isMarketOrder: false,
  });

  revalidatePath("/dashboard");
}
