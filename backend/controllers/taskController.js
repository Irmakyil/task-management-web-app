const asyncHandler = require('express-async-handler');
const Task = require('../models/Task'); 
const mongoose = require('mongoose');

// @desc    Kullanıcının tüm görevlerini listeleme
// @route   GET /api/tasks
// @access  Private (Login Required)
const getTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find({ user: req.user._id });
  res.json(tasks);
});

// @desc    Görev oluşturma
// @route   POST /api/tasks
// @access  Private
const createTask = asyncHandler(async (req, res) => {
  const { title, description, category, status, dueDate, dueTime } = req.body;

  if (!title || !category || !status) {
      return res.status(400).json({ message: 'Please provide title, category, and status' });
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
}); 

// @desc    Yeni bir görev oluşturma
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
      return res.status(404).json({ message: 'Task not found' });
  }

  // Gerekli alanlar (başlık, kategori, durum) dolu mu?
  if (task.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'You are not authorized to update this task' });
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

// @desc    Görev silme
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
      return res.status(404).json({ message: 'Task not found' });
  }

  if (task.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'You are not authorized to delete this task' });
  }

  await task.deleteOne(); 
  res.json({ message: 'Task successfully deleted' });
});

// @desc    Kullanıcı istatistiklerini getirme
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

  // Tekrar 'kategori'ye göre gruplar
  // ve 'statuses' adında bir diziye {status: 'To Do', count: 5} gibi bilgileri ekler
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

  const projectStage = {
    $project: {
      _id: 0, 
      category: '$_id', 
      statuses: 1,
      totalTasks: 1,
    },
  };

  const stats = await Task.aggregate([
    matchStage,
    groupStage1,
    groupStage2,
    projectStage,
  ]);

  if (!stats) {
      return res.status(404).json({ message: 'Statistics not found' });
  }
  res.json(stats);
});

// Fonksiyonları router'da kullanmak için dışa aktarma
module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats,
};


