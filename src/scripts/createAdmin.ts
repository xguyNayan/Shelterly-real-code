import { createAdminUser } from '../firebase/admin';

// Admin credentials
const ADMIN_EMAIL = 'admin@shelterly.in';
const ADMIN_PASSWORD = 'ShelterlywithSV';
const ADMIN_NAME = 'Shelterly Admin';

// Create admin user
const createAdmin = async () => {
  try {
     ('Creating admin user...');
    await createAdminUser(ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME);
     ('Admin user created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

// Run the script
createAdmin();
