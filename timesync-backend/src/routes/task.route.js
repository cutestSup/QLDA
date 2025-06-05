const express = require("express");
const router = express.Router();
const Task = require("../models/task.model");
const Category = require("../models/category.model");

// Get all tasks or search with filters
router.get("/", async (req, res) => {
  try {
    const where = { userId: req.user.id };
    const filters = req.query;

    // Apply date filters if provided in query params
    if (filters.year) where.year = parseInt(filters.year);
    if (filters.month) where.month = parseInt(filters.month); 
    if (filters.day) where.day = parseInt(filters.day);
    if (filters.categoryId) where.categoryId = parseInt(filters.categoryId);

    const tasks = await Task.findAll({
      where,
      include: [{ model: Category, as: 'category' }],
      order: [['dueDate', 'ASC']]
    });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new task
router.post("/", async (req, res) => {
  try {
    const maxTask = await Task.findOne({
      order: [['id', 'DESC']]
    });
    const nextId = req.body.id || (maxTask ? maxTask.id + 1 : 1);

    const dueDate = new Date(req.body.dueDate);
    const task = await Task.create({ 
      id: nextId,
      ...req.body, 
      userId: req.user.id,
      year: dueDate.getFullYear(),
      month: dueDate.getMonth() + 1,
      day: dueDate.getDate()
    });
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get task by ID
router.get("/:id", async (req, res) => {
  try {
    const task = await Task.findOne({
      where: { 
        id: req.params.id,
        userId: req.user.id
      },
      include: [{ model: Category, as: 'category' }]
    });
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update task
router.put("/:id", async (req, res) => {
  try {
    const [updated] = await Task.update(req.body, {
      where: { 
        id: req.params.id,
        userId: req.user.id
      }
    });
    if (!updated) {
      return res.status(404).json({ error: "Task not found" });
    }
    const task = await Task.findByPk(req.params.id);
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete task
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Task.destroy({
      where: { 
        id: req.params.id,
        userId: req.user.id
      }
    });
    if (!deleted) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark task as complete
router.patch("/:id/complete", async (req, res) => {
  try {
    const [updated] = await Task.update(
      { completed: true },
      {
        where: { 
          id: req.params.id,
          userId: req.user.id
        }
      }
    );
    if (!updated) {
      return res.status(404).json({ error: "Task not found" });
    }
    const task = await Task.findByPk(req.params.id);
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
