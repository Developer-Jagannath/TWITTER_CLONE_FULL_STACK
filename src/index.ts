import { app } from "./app";
import { config } from "./config";
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

    // Start server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${config.nodeEnv}`);
      console.log(`URL: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to initialize application:', error);
    process.exit(1);
  }
};

// Start the application
initializeApp(); 