const express = require("express");
const router = express.Router();
const Event = require("../models/event.model");

router.get("/", async (req, res) => {
  const events = await Event.find({ userId: req.userId });
  res.json(events);
});

router.post("/", async (req, res) => {
  const event = await Event.create({ ...req.body, userId: req.userId });
  res.status(201).json(event);
});

router.get("/:id", async (req, res) => {
  const event = await Event.findOne({ _id: req.params.id, userId: req.userId });
  res.json(event);
});

router.put("/:id", async (req, res) => {
  const event = await Event.findOneAndUpdate({ _id: req.params.id, userId: req.userId }, req.body, { new: true });
  res.json(event);
});

router.delete("/:id", async (req, res) => {
  await Event.deleteOne({ _id: req.params.id, userId: req.userId });
  res.sendStatus(204);
});

module.exports = router;
