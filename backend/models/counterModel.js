const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Counter schema
const counterSchema = new Schema({
  _id: String, // This will be used to distinguish between different counters
  sequence_value: Number // This will store the current value of the counter
});

const Counter = mongoose.model('Counter', counterSchema);
module.exports = Counter;
