# Next.js Trading Simulator

A modern trading simulator application built with Next.js

https://github.com/user-attachments/assets/e9507547-44ee-47db-b067-a3fbbce0b764

Product demo: https://youtu.be/61x8dGf1CZs

## Tech Stack

- [Next.js](https://nextjs.org) - React framework
- [shadcn/ui](https://ui.shadcn.com) - UI components
- [TailwindCSS](https://tailwindcss.com) - Styling
- [Drizzle ORM](https://orm.drizzle.team) - Database ORM
- [Socket.IO](https://socket.io) - Real-time communication
- [BetterAuth](https://better-auth.vercel.app/) - Authentication service
- [Binance Websockets API](https://developers.binance.com/docs/binance-spot-api-docs/web-socket-api) - BTCUSDT Real time prices

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
BETTER_AUTH_SECRET="your-secret-here"
DATABASE_URL="your-postgresql-connection-string"
PORT="3000"
NEXT_PUBLIC_WEBSOCKET_URL="ws://localhost:3000"
PRODUCTION_URL="https://trade.jorgetoh.me"
```
