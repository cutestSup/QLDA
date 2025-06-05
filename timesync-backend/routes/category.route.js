const express = require("express");
const router = express.Router();
const Category = require("../models/category.model");

// Get all categories
router.get("/", async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { userId: req.user.id }
    });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new category
router.post("/", async (req, res) => {
  try {
    // Find the highest existing ID
    const maxCategory = await Category.findOne({
      order: [['id', 'DESC']]
    });
    const nextId = req.body.id || (maxCategory ? maxCategory.id + 1 : 1);

    const category = await Category.create({ 
      id: nextId,
      ...req.body, 
      userId: req.user.id 
    });
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get category by ID
router.get("/:id", async (req, res) => {
  try {
    const category = await Category.findOne({
      where: { 
        id: req.params.id,
        userId: req.user.id
      }
    });
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update category
router.put("/:id", async (req, res) => {
  try {
    const [updated] = await Category.update(req.body, {
      where: { 
        id: req.params.id,
        userId: req.user.id
      }
    });
    if (!updated) {
      return res.status(404).json({ error: "Category not found" });
    }
    const category = await Category.findByPk(req.params.id);
    res.json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete category
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Category.destroy({
      where: { 
        id: req.params.id,
        userId: req.user.id
      }
    });
    if (!deleted) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
