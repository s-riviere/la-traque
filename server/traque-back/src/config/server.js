import { config } from "dotenv";
config();

export const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || "";
export const HOST = process.env.HOST || "0.0.0.0";
export const PORT = Number(process.env.PORT) || 3000;
