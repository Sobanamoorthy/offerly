const express = require("express");
const router = express.Router();
const workerController = require("../controllers/workerController");

// Categories
router.get("/categories", workerController.getCategories);

// Only keep this
router.get("/jobs", workerController.getJobs);
router.get("/profile", workerController.getWorkerProfile);
router.post("/profile", workerController.updateWorkerProfile); // Should be PUT/POST
router.get("/", workerController.getAllWorkers);

module.exports = router;
