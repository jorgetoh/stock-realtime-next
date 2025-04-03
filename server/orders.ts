import { Server } from "socket.io";
import { serverDb } from "./db";
import { orders, userBalances } from "@/database/schema";
import { eq } from "drizzle-orm";
import { notifyUserOrderChange } from "./websockets";

export async function processOrders(currentPrice: number, io: Server) {
  try {
    const pendingOrders = await serverDb
      .select()
      .from(orders)
      .where(eq(orders.status, "PENDING"));

    for (const order of pendingOrders) {
      if (!order.isMarketOrder && order.price) {
        const orderPrice = parseFloat(order.price);
        if (order.type === "BUY" && currentPrice > orderPrice) continue;
        if (order.type === "SELL" && currentPrice < orderPrice) continue;
      }

      const userBalance = await serverDb
        .select()
        .from(userBalances)
        .where(eq(userBalances.userId, order.userId))
        .limit(1);

      if (!userBalance.length) {
        await serverDb
          .update(orders)
          .set({ status: "CANCELLED" })
          .where(eq(orders.id, order.id));
        await notifyUserOrderChange(
          order.userId,
          order.id,
          "CANCELLED",
          order.type,
          order.totalValue,
          io
        );
        continue;
      }

      const balance = userBalance[0];
      const orderAmount = parseFloat(order.amount);
      const orderValue = parseFloat(order.totalValue);
      const currentUsdBalance = parseFloat(balance.usdBalance);
      const currentBtcBalance = parseFloat(balance.btcBalance);

      if (order.type === "BUY") {
        if (currentUsdBalance < orderValue) {
          await serverDb
            .update(orders)
            .set({ status: "CANCELLED" })
            .where(eq(orders.id, order.id));
          await notifyUserOrderChange(
            order.userId,
            order.id,
            "CANCELLED",
            order.type,
            order.totalValue,
            io
          );
          continue;
        }
      } else {
        if (currentBtcBalance < orderAmount) {
          await serverDb
            .update(orders)
            .set({ status: "CANCELLED" })
            .where(eq(orders.id, order.id));
          await notifyUserOrderChange(
            order.userId,
            order.id,
            "CANCELLED",
            order.type,
            order.totalValue,
            io
          );
          continue;
        }
      }

      await serverDb.transaction(async (tx) => {
        await tx
          .update(orders)
          .set({
            status: "COMPLETED",
            completedAt: new Date(),
          })
          .where(eq(orders.id, order.id));

        if (order.type === "BUY") {
          await tx
            .update(userBalances)
            .set({
              usdBalance: (currentUsdBalance - orderValue).toString(),
              btcBalance: (currentBtcBalance + orderAmount).toString(),
            })
            .where(eq(userBalances.userId, order.userId));
        } else {
          await tx
            .update(userBalances)
            .set({
              usdBalance: (currentUsdBalance + orderValue).toString(),
              btcBalance: (currentBtcBalance - orderAmount).toString(),
            })
            .where(eq(userBalances.userId, order.userId));
        }
      });

      await notifyUserOrderChange(
        order.userId,
        order.id,
        "COMPLETED",
        order.type,
        order.totalValue,
        io
      );
    }
  } catch (error) {
    console.error("Error processing orders:", error);
  }
}
