import { hashPassword } from './auth';
import { storage } from './storage';

export async function initializeSuperAdmin(): Promise<void> {
  try {
    console.log('🚀 Initializing superadmin user...');

    // Check if any superadmin users exist
    const users = await storage.getUsers();
    const existingSuperAdmins = users.filter(user => user.role === 'superadmin');

    if (existingSuperAdmins.length > 0) {
      console.log(`✅ Found ${existingSuperAdmins.length} existing superadmin user(s). Skipping initialization.`);
      return;
    }

    console.log('📝 No superadmin users found. Creating default superadmin...');

    // Check if username 'superadmin' already exists
    try {
      await storage.findUserByUsername('superadmin');
      console.log('⚠️ Username "superadmin" already exists but with different role. Skipping creation.');
      return;
    } catch (error) {
      // User doesn't exist, which is what we want
    }

    // Hash the password
    const hashedPassword = await hashPassword('superadmin123');

    // Create the superadmin user
    await storage.createUser({
      username: 'superadmin',
      email: 'superadmin@southdelhirealty.com',
      password: hashedPassword,
      role: 'superadmin'
    });

    console.log('✅ Default superadmin user created successfully!');
    console.log('📋 Credentials:');
    console.log('   Username: superadmin');
    console.log('   Password: superadmin123');
    console.log('   Email: superadmin@southdelhirealty.com');
    console.log('   Role: superadmin');
    console.log('⚠️  Please change the password after first login!');

  } catch (error) {
    console.error(`❌ Error initializing superadmin: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
} 