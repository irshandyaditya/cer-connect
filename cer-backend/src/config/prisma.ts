import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { NODE_ENV } from "./variables";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });

const prisma = new PrismaClient({
  adapter,
  log:
    NODE_ENV === "development"
      ? ["query", "warn", "error"]
      : ["error"],
});

export default prisma;