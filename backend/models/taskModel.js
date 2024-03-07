const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const taskSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  date: { 
    type: Date,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    required: true
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
    enum: ['In Progress', 'Past Due'],
    default: function() {
      const now = new Date();
      return now > this.date ? 'Past Due' : 'In Progress';
    }
  },  
  editHistory: [{ 
    type: String,
  }],  
  employees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  }]
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
