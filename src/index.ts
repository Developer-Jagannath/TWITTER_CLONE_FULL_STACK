import { app } from "./app";
import { config } from "./config/config";
import { testDatabaseConnection } from './config/database';


const PORT = config.port || 3000;

// Initialize database connection
const initializeApp = async () => {
  try {
    // Test database connection
    const dbConnected = await testDatabaseConnection();
    if (!dbConnected) {
      console.error('Failed to connect to database');
      process.exit(1);
    }
    console.log('✅ Database connection successful!');

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📱 Environment database: ${config.nodeEnv}`);
      console.log(`🌐 URL: http://localhost:${PORT}`);
      console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
      console.log(`👥 User endpoints: http://localhost:${PORT}/api/user`);
      console.log(`🐦 Tweet endpoints: http://localhost:${PORT}/api/tweet`);
      console.log(`📸 Image upload endpoints: http://localhost:${PORT}/api/uploads`);
    });
  } catch (error) {
    console.error('Failed to initialize application:', error);
    process.exit(1);
  }
};

// Start the application
initializeApp(); 