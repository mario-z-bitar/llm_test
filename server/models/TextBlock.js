// models/TextBlock.js
const mongoose = require('mongoose');
const Block = require('./Block'); // Import the base Block model

const TextBlockSchema = new mongoose.Schema({
  content: {
    type: String,
    default: ''
  },
  sourceLLMBlockId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LLMBlock', // Reference to an LLMBlock
    default: null
  }
});

// Create the 'TextBlock' discriminator model
// This will create documents in the 'blocks' collection with 'type: "text"'
module.exports = Block.discriminator('text', TextBlockSchema);