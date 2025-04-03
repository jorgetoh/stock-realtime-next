import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";
import WebSocket from "ws";
import { serverDb } from "./server/db";
import { orders, userBalances } from "@/database/schema";
import { eq, and } from "drizzle-orm";

interface PriceData {
  symbol: string;
  price: string;
  priceChange: string;
  priceChangePercent: string;
  high: string;
  low: string;
  volume: string;
  timestamp: string;
}

const port = parseInt(process.env.PORT || "3000", 10);
const wsPort = parseInt(process.env.WS_PORT || "3001", 10);
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

let priceHistory: PriceData[] = [];

const socketToUser = new Map<string, string>();
const userToSocket = new Map<string, string>();

async function notifyUserOrderChange(
  userId: string,
  orderId: string,
  status: "COMPLETED" | "CANCELLED",
  orderType: "BUY" | "SELL",
  totalValue: string,
  io: Server
) {
  const socketId = userToSocket.get(userId);
  if (socketId) {
    console.log(
      `📢 Notifying user ${userId} about ${orderType} order status change to ${status}`,
      {
        orderType,
        status,
        totalValue,
        socketId,
      }
    );
    io.to(socketId).emit("orderStatusChange", {
      orderType,
      status,
      totalValue,
    });
  } else {
    console.log(`⚠️ No socket found for user ${userId}`);
  }
}

async function processOrders(currentPrice: number, io: Server) {
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

const connectToBinance = (io: Server) => {
  console.log("🔄 Connecting to Binance WebSocket...");

  const binanceWs = new WebSocket(
    "wss://stream.binance.com:9443/ws/btcusdt@ticker"
  );

  binanceWs.on("open", () => {
    console.log("✅ Successfully connected to Binance WebSocket");
  });

  binanceWs.on("message", (data: WebSocket.Data) => {
    const tickerData = JSON.parse(data.toString());
    const priceData: PriceData = {
      symbol: "BTCUSDT",
      price: tickerData.c,
      priceChange: tickerData.p,
      priceChangePercent: tickerData.P,
      high: tickerData.h,
      low: tickerData.l,
      volume: tickerData.v,
      timestamp: new Date().toISOString(),
    };

    priceHistory.push(priceData);
    if (priceHistory.length > 100) {
      priceHistory = priceHistory.slice(-100);
    }

    processOrders(parseFloat(tickerData.c), io);

    io.emit("btcPrice", priceData);
  });

  binanceWs.on("error", (error: Error) => {
    console.error("❌ Binance WebSocket error:", error);
    console.log("🔄 Attempting to reconnect in 5 seconds...");
    setTimeout(() => connectToBinance(io), 5000);
  });

  binanceWs.on("close", () => {
    console.log("⚠️ Binance WebSocket connection closed");
    console.log("🔄 Attempting to reconnect in 5 seconds...");
    setTimeout(() => connectToBinance(io), 5000);
  });

  return binanceWs;
};

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url || "", true);
    handle(req, res, parsedUrl);
  }).listen(port);

  const wsServer = createServer();
  const io = new Server(wsServer, {
    cors: {
      origin:
        process.env.NODE_ENV === "production"
          ? process.env.PRODUCTION_URL
          : `http://localhost:${port}`,
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
    allowEIO3: true,
  });
  wsServer.listen(wsPort);

  let connectedClients = 0;

  io.on("connection", (socket) => {
    connectedClients++;
    console.log(`👤 Client connected (Total clients: ${connectedClients})`);
    console.log(`🔌 Socket ID: ${socket.id}`);

    socket.on("authenticate", ({ userId }: { userId: string }) => {
      console.log(`🔑 Authenticating socket ${socket.id} for user ${userId}`);

      const existingSocketId = userToSocket.get(userId);
      if (existingSocketId) {
        socketToUser.delete(existingSocketId);
      }
      socketToUser.delete(socket.id);

      socketToUser.set(socket.id, userId);
      userToSocket.set(userId, socket.id);

      console.log(`✅ Socket ${socket.id} authenticated for user ${userId}`);
    });

    socket.on("disconnect", () => {
      connectedClients--;
      const userId = socketToUser.get(socket.id);

      if (userId) {
        socketToUser.delete(socket.id);
        userToSocket.delete(userId);
        console.log(
          `👋 User ${userId} disconnected (Total clients: ${connectedClients})`
        );
      } else {
        console.log(
          `👋 Unauthenticated client disconnected (Total clients: ${connectedClients})`
        );
      }

      console.log(`🔌 Socket ID: ${socket.id}`);
    });

    socket.on("requestBtcPrice", () => {
      const userId = socketToUser.get(socket.id);
      const userInfo = userId ? ` (User: ${userId})` : " (Unauthenticated)";
      console.log(`📡 Client ${socket.id}${userInfo} requested BTC price`);

      if (priceHistory.length > 0) {
        console.log(
          `📊 Sending ${priceHistory.length} historical prices to client ${socket.id}${userInfo}`
        );
        socket.emit("priceHistory", priceHistory);
      }
    });
  });

  let binanceWs = connectToBinance(io);

  console.log(
    `🚀 Server listening at http://localhost:${port} as ${
      dev ? "development" : process.env.NODE_ENV
    }`
  );
  console.log(
    `🔌 WebSocket server listening at ${process.env.NEXT_PUBLIC_WEBSOCKET_URL}`
  );
});
