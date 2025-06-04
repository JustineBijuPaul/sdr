import dotenv from 'dotenv';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import * as schema from './shared/schema';
import { hashPassword } from './server/auth';

// Load environment variables
dotenv.config();

// Function to create database schema
async function setupDatabase() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }
  
  console.log("Starting database setup...");
  const queryClient = postgres(process.env.DATABASE_URL);
  const db = drizzle(queryClient);
  
  try {
    // Create a super admin user
    console.log("Creating super admin user...");
    try {
      const hashedPassword = await hashPassword("admin123");
      await db.insert(schema.users).values({
        username: "admin",
        email: "admin@example.com",
        password: hashedPassword,
        role: "admin"
      });
      console.log("Super admin user created successfully!");
    } catch (error) {
      console.log("Super admin user may already exist:", error);
    }
    
    // Add sample properties
    console.log("Creating sample properties...");
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
          areaUnit: "sq_ft",
          bedrooms: 3,
          bathrooms: 2,
          price: 12000000,
          contactDetails: "+91 98765 43210",
          isActive: true
        } as any,
        {
          title: "Commercial Space in Hauz Khas",
          slug: "commercial-space-hauz-khas",
          description: "Prime commercial space available for rent in the heart of Hauz Khas.",
          status: "rent",
          category: "commercial",
          propertyType: "shop",
          area: 800,
          areaUnit: "sq_ft",
          price: 150000,
          contactDetails: "+91 98765 43210",
          isActive: true
        }
      ];
      
      for (const property of properties) {
        await db.insert(schema.properties).values(property);
      }
      console.log("Sample properties created successfully!");
    } catch (error) {
      console.log("Sample properties may already exist:", error);
    }
    
    console.log("Database setup completed!");
    process.exit(0);
  } catch (error) {
    console.error("Error during database setup:", error);
    process.exit(1);
  }
}

// Run the setup
setupDatabase().catch(err => {
  console.error('Failed to set up database:', err);
  process.exit(1);
});