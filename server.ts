import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";

import { PORT, WS_PORT, DEV, CORS_ORIGIN } from "./server/config";
import { setupWebSocketServer } from "./server/websockets";
import { connectToBinance } from "./server/binance";

const app = next({ dev: DEV });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url || "", true);
    handle(req, res, parsedUrl);
  }).listen(PORT);

  const wsServer = createServer();
  const io = new Server(wsServer, {
    cors: {
      origin: CORS_ORIGIN,
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
    allowEIO3: true,
  });
  wsServer.listen(WS_PORT);

  setupWebSocketServer(io);

  const binanceWs = connectToBinance(io);

  console.log(
    `🚀 Server listening at http://localhost:${PORT} as ${
      DEV ? "development" : process.env.NODE_ENV
    }`
  );
  console.log(
    `🔌 WebSocket server listening at ${process.env.NEXT_PUBLIC_WEBSOCKET_URL}`
  );
});
