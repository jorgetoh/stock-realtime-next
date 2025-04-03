import { WebSocket } from "ws";
import { Server } from "socket.io";
import { processOrders } from "./orders";
import { priceHistory, PriceData } from "./websockets";

export function connectToBinance(io: Server) {
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
      priceHistory.splice(0, priceHistory.length - 100);
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
}
