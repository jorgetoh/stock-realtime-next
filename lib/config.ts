export const config = {
  websocket: {
    url: process.env.NEXT_PUBLIC_WEBSOCKET_URL || "ws://localhost:3103",
    options: {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
      secure: true,
      rejectUnauthorized: false,
    },
  },
} as const;
