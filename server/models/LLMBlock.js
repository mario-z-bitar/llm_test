// models/LLMBlock.js
const mongoose = require('mongoose');
const Block = require('./Block'); // Import the base Block model

const LLMBlockSchema = new mongoose.Schema({
  prompt: {
    type: String,
    required: true
  },
  inputTextBlockId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TextBlock', // Reference to a TextBlock
    default: null
  },
  outputTextBlockId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TextBlock', // Reference to a TextBlock
    default: null
  }
});

// Create the 'LLMBlock' discriminator model
// This will create documents in the 'blocks' collection with 'type: "llm"'
module.exports = Block.discriminator('llm', LLMBlockSchema);