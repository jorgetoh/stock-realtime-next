"use client";

import { useSocket } from "@/context/socket-context";

export const SocketStatus = () => {
  const { isConnected, connectionError } = useSocket();

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium">
      <div className="relative">
        <div
          className={`absolute inset-0 rounded-full animate-ping ${
            isConnected ? "bg-green-400" : "bg-red-400"
          } opacity-75`}
        />

        <div
          className={`relative w-2 h-2 rounded-full ${
            isConnected ? "bg-green-500" : "bg-red-500"
          }`}
        />
      </div>
      <span className={isConnected ? "text-green-700" : "text-red-700"}>
        {isConnected ? "Connected" : "Disconnected"}
      </span>
    </div>
  );
};
