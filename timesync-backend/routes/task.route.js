const express = require("express");
const router = express.Router();
const Task = require("../models/task.model");
const Category = require("../models/category.model");

// Get all tasks
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.findAll({
      where: { userId: req.user.id },
      include: [{ model: Category, as: 'category' }]
    });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new task
router.post("/", async (req, res) => {
  try {
    // Find the highest existing ID
    const maxTask = await Task.findOne({
      order: [['id', 'DESC']]
    });
    const nextId = req.body.id || (maxTask ? maxTask.id + 1 : 1);

    const task = await Task.create({ 
      id: nextId,
      ...req.body, 
      userId: req.user.id 
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
