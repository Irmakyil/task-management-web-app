const mongoose = require('mongoose');

//Görevlerin veritabanı şeması
const taskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId, 
      required: true,
      ref: 'User', 
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    category: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['Incomplete', 'In Progress', 'Completed'],
      default: 'Incomplete', 
    },
    dueDate: {
      type: Date,
      required: false,
    },
    dueTime: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Task', taskSchema);