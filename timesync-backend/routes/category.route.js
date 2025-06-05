const express = require("express");
const router = express.Router();
const Category = require("../models/category.model");

router.get("/", async (req, res) => {
  const categories = await Category.find({ userId: req.userId });
  res.json(categories);
});

router.post("/", async (req, res) => {
  const category = await Category.create({ ...req.body, userId: req.userId });
  res.status(201).json(category);
});

router.put("/:id", async (req, res) => {
  const category = await Category.findOneAndUpdate({ _id: req.params.id, userId: req.userId }, req.body, { new: true });
  res.json(category);
});

router.delete("/:id", async (req, res) => {
  await Category.deleteOne({ _id: req.params.id, userId: req.userId });
  res.sendStatus(204);
});

module.exports = router;
