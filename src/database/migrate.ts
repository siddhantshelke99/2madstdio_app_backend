import { sequelize } from '../config/database';
import '../models'; // Import models & associations

export const runMigrations = async () => {
  try {
    console.log('🔄 Connecting to database and running schema synchronization...');
    await sequelize.authenticate();
    console.log('✅ Connected to PostgreSQL database.');

    // Enable UUID extension if supported
    try {
      await sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
      console.log('✅ Extension "uuid-ossp" ensured.');
    } catch (extErr: any) {
      console.log('ℹ️ UUID extension note:', extErr.message);
    }

    // Sync all defined models to the DB
    await sequelize.sync({ alter: true });
    console.log('✅ Database migration / synchronization completed successfully.');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

if (require.main === module) {
  runMigrations();
}
