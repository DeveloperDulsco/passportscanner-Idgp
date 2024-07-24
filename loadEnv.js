// loadEnv.js
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Determine the environment file to load
const envFile = path.resolve(__dirname, 'environment', `.env.${process.env.NODE_ENV || 'development'}`);

// Load the environment variables
if (fs.existsSync(envFile)) {
  dotenv.config({ path: envFile });
  console.log(`Loaded environment variables from ${envFile}`);
  console.log('Environment Variables:', process.env); // Debugging
} else {
  console.error(`Environment file ${envFile} not found!`);
}
