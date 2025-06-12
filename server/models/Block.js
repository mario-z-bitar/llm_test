// models/Block.js
const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema({
  targetBlockId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Block' // Reference to another Block document
  },
  connectionType: {
    type: String,
    enum: ['input', 'output'],
    required: true,
    lowercase: true // Ensure consistency
  }
}, { _id: false }); // Don't create an _id for subdocuments in the array

const blockSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['text', 'llm'],
    lowercase: true // Ensure consistency
  },
  x: {
    type: Number,
    required: true,
    default: 0
  },
  y: {
    type: Number,
    required: true,
    default: 0
  },
  connections: [connectionSchema] // Array of connection subdocuments
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
  discriminatorKey: 'type', // Key to differentiate between block types
  collection: 'blocks' // All block types will be stored in a single 'blocks' collection
});

// Export the base model. Specific types will be created using discriminator.
module.exports = mongoose.model('Block', blockSchema);