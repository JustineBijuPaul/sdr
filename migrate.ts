import dotenv from 'dotenv';
import { drizzle } from "drizzle-orm/mysql2";
import { migrate } from "drizzle-orm/mysql2/migrator";
import mysql from "mysql2/promise";
import * as schema from "./shared/schema";

// Load environment variables
dotenv.config();

// Function to create MySQL database
async function createMySqlDatabase() {
  if (!process.env.DATABASE_URL && !process.env.DB_HOST) {
    throw new Error("DATABASE_URL or DB connection parameters must be set");
  }
  
  console.log("Starting database migration to MySQL...");
  
  try {
    // Create a MySQL connection pool
    const connectionPool = process.env.DATABASE_URL 
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
    
    // Initialize Drizzle ORM
    const db = drizzle(connectionPool, { schema, mode: "default" });
    
    // Apply migrations
    console.log("Creating database schema...");
    
    // This will create all tables defined in the schema
    await migrate(db, { migrationsFolder: './migrations' });
    
    console.log("Database schema created successfully!");
    
    // Create a super admin user for initial login
    console.log("Creating test user...");
    try {
      const user = {
        username: "admin",
        email: "admin@example.com",
        password: "$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm", // password is "password"
        role: "admin"
      };
      
      await db.insert(schema.users).values(user);
      console.log("Test user created successfully!");
    } catch (error) {
      console.log("Test user may already exist:", error);
    }
    
    // Add some test properties
    console.log("Creating test properties...");
    try {
      const properties = [
        {
          title: "Luxury Apartment in Delhi",
          slug: "luxury-apartment-delhi",
          description: "A beautiful luxury apartment with all modern amenities.",
          status: "sale",
          category: "residential",
          propertyType: "apartment",
          subType: "3bhk",
          area: 1500,
          areaUnit: "sq-ft",
          bedrooms: 3,
          bathrooms: 2,
          price: 12000000,
          contactDetails: "+91 98765 43210",
          isActive: true
        },
        {
          title: "Commercial Space in Hauz Khas",
          slug: "commercial-space-hauz-khas",
          description: "Prime commercial space available for rent in the heart of Hauz Khas.",
          status: "rent",
          category: "commercial",
          propertyType: "shop",
          area: 800,
          areaUnit: "sq-ft",
          price: 150000,
          contactDetails: "+91 98765 43210",
          isActive: true
        }
      ];
      
      for (const property of properties) {
        await db.insert(schema.properties).values(property);
      }
      console.log("Test properties created successfully!");
    } catch (error) {
      console.log("Properties may already exist:", error);
    }
    
    console.log("MySQL database setup completed!");
    process.exit(0);
  } catch (error) {
    console.error("Error during database migration:", error);
    process.exit(1);
  }
}

// Run the migration
createMySqlDatabase();