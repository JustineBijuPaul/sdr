import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL && !process.env.DB_HOST) {
  throw new Error("DATABASE_URL or DB_HOST must be provided");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "mysql",
  dbCredentials: process.env.DATABASE_URL 
    ? {
        url: process.env.DATABASE_URL,
      }
    : {
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME || "southdelhirealestate",
        port: parseInt(process.env.DB_PORT || "3306"),
      },
});
