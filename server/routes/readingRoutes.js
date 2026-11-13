
const express = require("express");
const router = express.Router();

const authenticateToken = require("../middleware/authMiddleware");

const {
  addReading,
  getReadings,
  updateReading,
  deleteReading
} = require("../controllers/readingController");

router.post("/", authenticateToken, addReading);
router.get("/", authenticateToken, getReadings);
router.put("/:id", authenticateToken, updateReading);
router.delete("/:id", authenticateToken, deleteReading);

module.exports = router;
