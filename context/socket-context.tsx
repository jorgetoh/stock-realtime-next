import { createContext, useContext, useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import { useSession } from "@/hooks/use-auth-hooks";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { config } from "@/lib/config";

interface PriceData {
  symbol: string;
  price: string;
  priceChangePercent: string;
  timestamp: string;
}

interface SocketContextType {
  data: PriceData | null;
  priceHistory: PriceData[];
  socket: Socket | null;
  isConnected: boolean;
  connectionError: string | null;
}

declare global {
  interface Window {
    enableBtcLogs: boolean;
  }
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [data, setData] = useState<PriceData | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceData[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    window.enableBtcLogs = false;
    console.log(
      "ℹ️ To enable BTC price logging, run: window.enableBtcLogs = true"
    );

    console.log("🔄 Initializing WebSocket connection...");

    const newSocket = io(config.websocket.url, config.websocket.options);

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("✅ WebSocket connected successfully");
      console.log(`🔌 Socket ID: ${newSocket.id}`);
      setIsConnected(true);
      setConnectionError(null);

      if (session?.user?.id) {
        console.log("👤 Sending user ID to server...");
        newSocket.emit("authenticate", { userId: session.user.id });
      }

      console.log("📡 Requesting initial BTC price...");
      newSocket.emit("requestBtcPrice");
    });

    newSocket.on("connect_error", (error) => {
      console.error("❌ WebSocket connection error:", error.message);
      setIsConnected(false);
      setConnectionError(error.message);
    });

    newSocket.on("priceHistory", (history: PriceData[]) => {
      console.log(`📊 Received ${history.length} historical prices`);
      setPriceHistory(history);
    });

    newSocket.on("btcPrice", (newData: PriceData) => {
      if (window.enableBtcLogs) {
        console.log("📊 Received BTC price update:", {
          price: newData.price,
          change: newData.priceChangePercent + "%",
          timestamp: new Date(newData.timestamp).toLocaleString(),
        });
      }
      setData(newData);

      setPriceHistory((prevHistory) => {
        const newHistory = [...prevHistory, newData];
        return newHistory.slice(-100);
      });
    });

    newSocket.on(
      "orderStatusChange",
      (data: {
        orderType: "BUY" | "SELL";
        status: "COMPLETED" | "CANCELLED";
        totalValue: string;
      }) => {
        console.log("📢 Received order status change:", data);

        toast(
          `${data.orderType} order for $${parseFloat(data.totalValue).toFixed(2)} has been ${data.status.toLowerCase()}`,
          {
            duration: 5000,
          }
        );

        if (window.location.pathname === "/dashboard") {
          router.refresh();
        }
      }
    );

    newSocket.on("disconnect", (reason) => {
      console.log("⚠️ WebSocket disconnected");
      console.log(`📝 Disconnect reason: ${reason}`);
      setIsConnected(false);
    });

    newSocket.on("reconnect", (attemptNumber) => {
      console.log(`🔄 WebSocket reconnected after ${attemptNumber} attempts`);
      setIsConnected(true);
      setConnectionError(null);

      if (session?.user?.id) {
        console.log("👤 Re-authenticating user after reconnection...");
        newSocket.emit("authenticate", { userId: session.user.id });
      }

      console.log("📡 Requesting BTC price after reconnection...");
      newSocket.emit("requestBtcPrice");
    });

    newSocket.on("reconnect_error", (error) => {
      console.error("❌ WebSocket reconnection error:", error);
    });

    newSocket.on("reconnect_failed", () => {
      console.error("❌ WebSocket reconnection failed");
      setIsConnected(false);
      setConnectionError("Failed to reconnect");
    });

    return () => {
      console.log("👋 Cleaning up WebSocket connection...");
      if (newSocket.connected) {
        newSocket.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (socket?.connected && session?.user?.id) {
      console.log("👤 User authenticated, sending user ID to server...");
      socket.emit("authenticate", { userId: session.user.id });
    }
  }, [session?.user?.id, socket?.connected]);

  return (
    <SocketContext.Provider
      value={{ data, priceHistory, socket, isConnected, connectionError }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
