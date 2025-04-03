export const config = {
  websocket: {
    url: process.env.NEXT_PUBLIC_WEBSOCKET_URL || "ws://localhost:3001",
    options: {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
      secure: process.env.NODE_ENV === "production",
      rejectUnauthorized: false,
    },
  },
} as const;
