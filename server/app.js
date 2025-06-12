
// server.js
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./db'); // Your DB connection setup

dotenv.config(); // Load environment variables from .env

// Connect to the database
connectDB();

const app = express();
app.use(express.json()); // Enable JSON body parsing

// Import models (this registers the discriminators with Mongoose)
const Block = require('./models/Block');
const TextBlock = require('./models/TextBlock');
const LLMBlock = require('./models/LLMBlock');

// Now you can use TextBlock and LLMBlock directly for CRUD operations:

// Example route to create a new TextBlock
app.post('/api/blocks/text', async (req, res) => {
  try {
    const newTextBlock = new TextBlock({
      x: req.body.x,
      y: req.body.y,
      content: req.body.content || '',
      connections: req.body.connections || []
      // type is automatically set to 'text' by the discriminator
    });
    const savedBlock = await newTextBlock.save();
    res.status(201).json(savedBlock);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Example route to create a new LLMBlock
app.post('/api/blocks/llm', async (req, res) => {
  try {
    const newLLMBlock = new LLMBlock({
      x: req.body.x,
      y: req.body.y,
      prompt: req.body.prompt,
      connections: req.body.connections || []
      // type is automatically set to 'llm' by the discriminator
    });
    const savedBlock = await newLLMBlock.save();
    res.status(201).json(savedBlock);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Example route to get all blocks (using the base Block model)
app.get('/api/blocks', async (req, res) => {
  try {
    const allBlocks = await Block.find({});
    res.json(allBlocks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ... more routes for update, delete, LLM generation ...
app.get('/', (req, res) => {
  res.send('Server is running!');
});

// Route 1: Create a new Block (TextBlock or LLMBlock)
app.post('/api/blocks', async (req, res) => {
  const { type, x, y, content, prompt } = req.body;

  if (!type || typeof x === 'undefined' || typeof y === 'undefined') {
    return res.status(400).json({ message: 'Block type, x, and y coordinates are required.' });
  }

  try {
    let newBlock;
    if (type === 'text') {
      newBlock = new TextBlock({
        x,
        y,
        content: content || '', // Default to empty string if not provided
        connections: [] // Start with no connections
      });
    } else if (type === 'llm') {
      if (!prompt) {
        return res.status(400).json({ message: 'LLM Block requires a prompt.' });
      }
      newBlock = new LLMBlock({
        x,
        y,
        prompt,
        connections: [] // Start with no connections
      });
    } else {
      return res.status(400).json({ message: 'Invalid block type specified.' });
    }

    const savedBlock = await newBlock.save();
    res.status(201).json(savedBlock); // 201 Created status
  } catch (error) {
    console.error('Error creating block:', error);
    res.status(500).json({ message: 'Error creating block', error: error.message });
  }
});

// Route 2: Get all Blocks
app.get('/api/blocks', async (req, res) => {
  try {
    const allBlocks = await Block.find({}); // Find all documents in the 'blocks' collection
    res.status(200).json(allBlocks); // 200 OK status
  } catch (error) {
    console.error('Error fetching blocks:', error);
    res.status(500).json({ message: 'Error fetching blocks', error: error.message });
  }
});

// Route 3: Get a single Block by ID
app.get('/api/blocks/:id', async (req, res) => {
  try {
    const block = await Block.findById(req.params.id);
    if (!block) {
      return res.status(404).json({ message: 'Block not found.' });
    }
    res.status(200).json(block);
  } catch (error) {
    console.error('Error fetching block by ID:', error);
    // Handle invalid ID format (e.g., if ID is not a valid ObjectId string)
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid Block ID format.' });
    }
    res.status(500).json({ message: 'Error fetching block', error: error.message });
  }
});

// Route 4: Update a Block by ID
app.put('/api/blocks/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  console.log('Received PUT request for ID:', id);
  console.log('Received updates:', updates);

  try {
    // First, find the block to determine its type
    const existingBlock = await Block.findById(id);

    if (!existingBlock) {
      return res.status(404).json({ message: 'Block not found.' });
    }

    let updatedBlock;

    // Use the specific discriminator model for the update
    if (existingBlock.type === 'text') {
      updatedBlock = await TextBlock.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    } else if (existingBlock.type === 'llm') {
      updatedBlock = await LLMBlock.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    } else {
      // This case should ideally not happen if 'type' is properly validated
      return res.status(400).json({ message: 'Unknown block type.' });
    }

    console.log('Block returned from findByIdAndUpdate:', updatedBlock); // Verify again

    res.status(200).json(updatedBlock);
  } catch (error) {
    console.error('Error updating block:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid Block ID format.' });
    }
    // Handle Mongoose validation errors (e.g., if 'prompt' is missing for LLM update)
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error updating block', error: error.message });
  }
});

// Route 5: Delete a Block by ID
app.delete('/api/blocks/:id', async (req, res) => {
  try {
    const deletedBlock = await Block.findByIdAndDelete(req.params.id);

    if (!deletedBlock) {
      return res.status(404).json({ message: 'Block not found.' });
    }

    // Optionally, you might want to clean up references in other blocks here.
    // For example, if this was a TextBlock, remove its ID from any LLMBlock's input/output fields.
    // This is a more advanced step for later.

    res.status(204).send(); // 204 No Content for successful deletion
  } catch (error) {
    console.error('Error deleting block:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid Block ID format.' });
    }
    res.status(500).json({ message: 'Error deleting block', error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));