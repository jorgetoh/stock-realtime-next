export const PORT = parseInt(process.env.PORT || "3000", 10);
export const WS_PORT = parseInt(process.env.WS_PORT || "3001", 10);
export const DEV = process.env.NODE_ENV !== "production";
export const CORS_ORIGIN = DEV
  ? `http://localhost:${PORT}`
  : process.env.PRODUCTION_URL;
