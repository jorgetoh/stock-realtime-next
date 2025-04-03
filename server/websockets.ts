import { Server } from "socket.io";

const socketToUser = new Map<string, string>();
const userToSocket = new Map<string, string>();

export interface PriceData {
  symbol: string;
  price: string;
  priceChange: string;
  priceChangePercent: string;
  high: string;
  low: string;
  volume: string;
  timestamp: string;
}

export let priceHistory: PriceData[] = [];

export function setupWebSocketServer(io: Server) {
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

  return { socketToUser, userToSocket };
}

export function notifyUserOrderChange(
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
