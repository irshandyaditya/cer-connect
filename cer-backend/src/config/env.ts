import "dotenv/config";

export const env = {
  PORT: process.env.PORT || 3020,
  JWT_SECRET: process.env.JWT_SECRET || "secret",
  DATABASE_URL: process.env.DATABASE_URL!,
};