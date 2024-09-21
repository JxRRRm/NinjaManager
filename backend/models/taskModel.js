const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Counter = require('./counterModel'); // Adjust the path as needed

const taskSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  date: { 
    type: Date,
    required: false
  },
  description: {
    type: String,
    required: false
  },
  priority: {
    type: String,
    enum: ['HIGH', 'MEDIUM', 'LOW'],
    default: 'LOW',
    required: false
  },
  completed: {
    type: Boolean,
    default: false
  },
  deleted: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['TODO', 'IN PROGRESS', 'DONE'],
    default: 'TODO',
    required: false
  },  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // This should match the model name you used when you called mongoose.model('User', userSchema)
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // This can be optional as not all tasks might be updated.
  },
  editHistory: [{ 
    type: String,
  }],  
  employees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  }],
  id: {
    type: String, // Change to String to accommodate zero-padded IDs
    unique: true // Ensure uniqueness
  }
}, { 
  timestamps: true,
});

// Pre-save hook to generate an auto-incrementing ID
taskSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'task_id' }, // This identifies the counter for tasks
        { $inc: { sequence_value: 1 } }, // Increment the sequence value by 1
        { new: true, upsert: true } // Create the counter if it doesn't exist
      );
       // Pad the ID with leading zeros to ensure it has three digits
       this.id = counter.sequence_value.toString().padStart(3, '0');
      } catch (error) {
        return next(error);
      }
    }
    next();
  });

module.exports = mongoose.model('Task', taskSchema);