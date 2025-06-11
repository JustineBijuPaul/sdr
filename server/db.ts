import { drizzle } from "drizzle-orm/mysql2";
import * as mysql from "mysql2/promise";
import * as schema from "../shared/schema";

if (!process.env.DATABASE_URL && !process.env.DB_HOST) {
  throw new Error("DATABASE_URL or DB_HOST must be provided");
}

// Create MySQL connection
const connection = process.env.DATABASE_URL 
  ? mysql.createPool({
      uri: process.env.DATABASE_URL,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    })
  : mysql.createPool({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "southdelhirealestate",
      port: parseInt(process.env.DB_PORT || "3306"),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

// Drizzle ORM client
export const db = drizzle(connection, { schema, mode: "default" });

// Initialize database connection
export async function initializeDB(): Promise<void> {
  try {
    // Test the connection
    const conn = await connection.getConnection();
    console.log('✅ Database connection established successfully');
    console.log('📊 Database connection info:', {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT
    });
    conn.release();
    
    // Initialize any required database setup here
    // For example, you might want to run migrations or create initial data
    
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    throw error;
  }
}
