#!/usr/bin/env node

// Load local environment variables
require("dotenv").config({ path: ".env.local" });

// Start the server
require("../src/server.js");
