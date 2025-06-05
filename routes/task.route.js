const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const { Op } = require("sequelize");

// Get all tasks or filter by date
router.get("/", async (req, res) => {
  try {
    const where = { user_id: req.user.id };
    const filters = req.query;

    if (filters.year) where.year = parseInt(filters.year);
    if (filters.month) where.month = parseInt(filters.month);
    if (filters.day) where.day = parseInt(filters.day);
    if (filters.category) where.category = filters.category;

    const tasks = await Task.findAll({
      where,
      order: [['due_date', 'ASC']]
    });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new task
router.post("/", async (req, res) => {
  try {
    const { title, description, due_date, category } = req.body;
    
    const dueDate = new Date(due_date);
    const task = await Task.create({
      title,
      description,
      due_date,
      category,
      user_id: req.user.id,
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
        user_id: req.user.id
      }
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
        user_id: req.user.id
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
        user_id: req.user.id
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
          user_id: req.user.id
        }
      }
    );
    if (!updated) {
      return res.status(404).json({ error: "Task not found" });
    }
    const task = await Task.findByPk(req.params.id);
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
