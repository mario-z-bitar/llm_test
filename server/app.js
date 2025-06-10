require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb'); // Import MongoClient

const app = express();
const port = process.env.PORT || 3000; // Use port from environment or default to 3000

console.log('--- Server starting ---'); // Added
console.log('Port:', port); // Added

// Middleware to parse JSON request bodies
app.use(express.json());

// --- MongoDB Connection Setup ---
const uri = process.env.MONGODB_URI;
console.log('MongoDB URI from .env:', uri ? 'Loaded (masked)' : 'Not loaded - Check .env!'); // Added for debugging

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function connectDB() {
  console.log('Attempting to connect to MongoDB...'); // Added
  try {
    await client.connect();
    console.log('Client connected. Pinging admin DB...'); // Added
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    // Set up our database and collection references
    const database = client.db("llm_app_db");
    const documentsCollection = database.collection("documents");

    // Make the database and collection available to our routes
    app.locals.db = database;
    app.locals.documentsCollection = documentsCollection;

  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    // Ensure we log the actual error for debugging
    if (error.message.includes('MongooseServerSelectionError') || error.name === 'MongoNetworkError') {
        console.error("This often indicates network issues, incorrect URI, or IP address not whitelisted.");
    } else if (error.message.includes('Authentication failed')) {
        console.error("Check your database username and password.");
    }
    process.exit(1);
  }
}

// --- Routes ---
app.get('/', (req, res) => {
  res.send('Hello from the server!');
});

app.get('/api/documents', async (req, res) => {
  try {
    // Access documentsCollection via app.locals after successful DB connection
    if (!app.locals.documentsCollection) {
        console.error("MongoDB collection not initialized. DB connection might have failed or not completed.");
        return res.status(500).send("Server not fully ready or DB connection failed.");
    }
    const documents = await app.locals.documentsCollection.find({}).toArray();
    res.json(documents);
  } catch (error) {
    console.error("Error fetching documents:", error);
    res.status(500).send("Error fetching documents");
  }
});

// --- Start Server ---
// Connect to DB first, then start the server
connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
    console.log(`Access the server at: http://localhost:${port}`);
  });
}).catch(err => { // <-- Added .catch here for promises
    console.error('Error starting server after DB connection attempt:', err);
    process.exit(1);
});