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
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { success: false, message: "Not authenticated" };
    }

    const totalValue = amount * currentPrice;

    const balances = await db
      .select()
      .from(userBalances)
      .where(eq(userBalances.userId, session.user.id))
      .limit(1);

    if (!balances.length) {
      return { success: false, message: "User balance not found" };
    }

    const { usdBalance, btcBalance } = balances[0];

    if (type === "BUY" && parseFloat(usdBalance) < totalValue) {
      return { success: false, message: "Insufficient USD balance" };
    }

    if (type === "SELL" && parseFloat(btcBalance) < amount) {
      return { success: false, message: "Insufficient BTC balance" };
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
    return { success: true, message: "Market order created successfully" };
  } catch (error) {
    return {
      success: false,
      message: "Failed to create market order",
    };
  }
}

export async function createLimitOrder(
  type: "BUY" | "SELL",
  amount: number,
  price: number
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { success: false, message: "Not authenticated" };
    }

    const totalValue = amount * price;

    const balances = await db
      .select()
      .from(userBalances)
      .where(eq(userBalances.userId, session.user.id))
      .limit(1);

    if (!balances.length) {
      return { success: false, message: "User balance not found" };
    }

    const { usdBalance, btcBalance } = balances[0];

    if (type === "BUY" && parseFloat(usdBalance) < totalValue) {
      return { success: false, message: "Insufficient USD balance" };
    }

    if (type === "SELL" && parseFloat(btcBalance) < amount) {
      return { success: false, message: "Insufficient BTC balance" };
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
    return { success: true, message: "Limit order created successfully" };
  } catch (error) {
    return {
      success: false,
      message: "Failed to create limit order",
    };
  }
}
