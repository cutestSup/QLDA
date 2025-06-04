const express = require("express");
const router = express.Router();
const Notification = require("../models/notification.model");

router.get("/", async (req, res) => {
  const noti = await Notification.find({ userId: req.userId });
  res.json(noti);
});

router.post("/", async (req, res) => {
  const noti = await Notification.create({ ...req.body, userId: req.userId });
  res.status(201).json(noti);
});

router.patch("/:id/read", async (req, res) => {
  const noti = await Notification.findOneAndUpdate({ _id: req.params.id, userId: req.userId }, { read: true }, { new: true });
  res.json(noti);
});

router.delete("/:id", async (req, res) => {
  await Notification.deleteOne({ _id: req.params.id, userId: req.userId });
  res.sendStatus(204);
});

module.exports = router;
