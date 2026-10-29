import mongoose from "mongoose";
import config from "./config.js";

/**
 * Connects to MongoDB database using Mongoose.
 * Follows best practices: error handling, connection logging, and process exit on failure.
 */
async function connectDB() {
  try {
 

    // 2. Establish connection to the MongoDB cluster
    const connectionInstance = await mongoose.connect(config.MONGO_URI);

    // 3. Log success message along with the host name connected to
    console.log(`\n MongoDB connected successfully! DB HOST: ${connectionInstance.connection.host} \n`);
  } catch (error) {
    // 4. Handle connection error gracefully and terminate the process
    console.error("MongoDB connection failed:", error.message);
    process.exit(1); // Exit with failure code (1) to prevent running without a database
  }
}

// Optional: Listen to Mongoose connection events after initial connection
mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected. Attempting reconnection...");
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB runtime error:", err.message);
});

export default connectDB;
