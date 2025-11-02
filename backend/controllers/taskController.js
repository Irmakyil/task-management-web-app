const asyncHandler = require('express-async-handler');
const Task = require('../models/Task'); 
const mongoose = require('mongoose');

// @desc    List all of the user's tasks
// @route   GET /api/tasks
// @access  Private (Login Required)
const getTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find({ user: req.user._id });
  res.json(tasks);
});

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
const createTask = asyncHandler(async (req, res) => {
  const { title, description, category, status, dueDate, dueTime } = req.body;

  if (!title || !category || !status) {
    res.status(400);
    throw new Error('Please provide title, category, and status');
  }

  const task = new Task({
    user: req.user._id, 
    title,
    description,
    category,
    status,
    dueDate,
    dueTime,
  });

  const createdTask = await task.save();
  res.status(201).json(createdTask);
}); // <-- EKSİK OLAN PARANTEZ BURAYA EKLENDİ

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404); // 404 Not Found
    throw new Error('Task not found');
  }

  // Security: Does this task belong to this user?
  if (task.user.toString() !== req.user._id.toString()) {
    res.status(401); // 401 Unauthorized
    throw new Error('You are not authorized to update this task');
  }

  task.title = req.body.title || task.title;
  task.description = req.body.description || task.description;
  task.category = req.body.category || task.category;
  task.status = req.body.status || task.status;
  task.dueDate = req.body.dueDate || task.dueDate;
  task.dueTime = req.body.dueTime || task.dueTime;

  const updatedTask = await task.save();
  res.json(updatedTask);
});

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  if (task.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('You are not authorized to delete this task');
  }

  await task.deleteOne(); // Delete the task
  res.json({ message: 'Task successfully deleted' });
});

// @desc    Get user's task statistics
// @route   GET /api/tasks/stats
// @access  Private
const getTaskStats = asyncHandler(async (req, res) => {
  const matchStage = {
    $match: { user: new mongoose.Types.ObjectId(req.user._id) },
  };

  const groupStage1 = {
    $group: {
      _id: {
        category: '$category',
        status: '$status',
      },
      count: { $sum: 1 },
    },
  };

  // 3. Group the output again by category
  //    and push the status/count info into an array
  const groupStage2 = {
    $group: {
      _id: '$_id.category', 
      statuses: {
        $push: {
          status: '$_id.status',
          count: '$count',
        },
      },
      totalTasks: { $sum: '$count' }, 
    },
  };

  // 4. Rename the output field to "category"
  const projectStage = {
    $project: {
      _id: 0, 
      category: '$_id', 
      statuses: 1,
      totalTasks: 1,
    },
  };

  // 5. Run the Aggregation Pipeline
  const stats = await Task.aggregate([
    matchStage,
    groupStage1,
    groupStage2,
    projectStage,
  ]);

  if (!stats) {
    res.status(404);
    throw new Error('Statistics not found');
  }

  res.json(stats);
});

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats,
};


