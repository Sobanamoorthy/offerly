const mongoose = require("mongoose");
const Job = require("../models/Job");
const WorkerProfile = require("../models/WorkerProfile");

// Get Worker Profile (by User ID from token or query)
exports.getWorkerProfile = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : req.query.userId; // Support both auth middleware and query param for now
    if (!userId) return res.status(400).json({ message: "User ID required" });

    const profile = await WorkerProfile.findOne({ userId }).populate("userId", "name email");
    if (!profile) return res.status(404).json({ message: "Worker profile not found" });

    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update Worker Profile
exports.updateWorkerProfile = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : req.body.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const {
      mobile, jobCategory, experience, location, salary, skills,
      subSkills, languages, availability, latitude, longitude,
      dob, willingToTravel, willingDistricts
    } = req.body;

    let updateData = {
      mobile, jobCategory, experience, location, salary, skills,
      subSkills, languages, availability, willingToTravel,
      willingDistricts
    };

    if (dob) {
      updateData.dob = dob;
    } else {
      updateData.dob = null; // Unset or nullify if empty string
    }

    // If coordinates are provided, save them
    if (latitude && longitude) {
      updateData.coordinates = [parseFloat(longitude), parseFloat(latitude)]; // MongoDB uses [lng, lat]
    }

    const profile = await WorkerProfile.findOneAndUpdate(
      { userId },
      updateData,
      { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true }
    );

    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get All Workers (with filters)
exports.getAllWorkers = async (req, res) => {
  try {
    const {
      location, skill, category, lat, lng, distance,
      sortRating, sortPrice, experience, availableNow,
      topRated, rating, priceRange
    } = req.query;

    let query = {};

    // 1. Location-based search
    if (lat && lng) {
      const maxDist = distance ? parseInt(distance) * 1000 : 50000;
      query.coordinates = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: maxDist
        }
      };
    } else if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    // 2. Category-based filter
    if (category && category !== "All Categories" && category !== "Other") {
      query.jobCategory = { $regex: `^${category}$`, $options: "i" };
    }

    // 3. Skill-based search
    if (skill) {
      const skillRegex = new RegExp(skill, "i");
      query.$or = [
        { skills: { $in: [skillRegex] } },
        { subSkills: { $in: [skillRegex] } },
        { jobCategory: { $regex: skillRegex } }
      ];
    }

    // 4. Experience Filter (Precise ranges)
    if (experience) {
      if (experience === "0-1") query.experience = { $lte: 1 };
      else if (experience === "1-3") query.experience = { $gte: 1, $lte: 3 };
      else if (experience === "3-5") query.experience = { $gte: 3, $lte: 5 };
      else if (experience === "5-10") query.experience = { $gte: 5, $lte: 10 };
      else if (experience === "10+") query.experience = { $gte: 10 };
      // Fallbacks
      else if (experience === "0-2") query.experience = { $lte: 2 };
      else if (experience === "5+") query.experience = { $gt: 5 };
    }

    // 5. Rating Filter
    if (rating) {
      query.averageRating = { $gte: Number(rating) };
    } else if (topRated === "true") {
      query.averageRating = { $gt: 4.0 };
    }

    // 6. Price Range
    if (priceRange) {
      if (priceRange === "300-500") query.salary = { $gte: 300, $lte: 500 };
      else if (priceRange === "500-700") query.salary = { $gte: 500, $lte: 700 };
      else if (priceRange === "700-1000") query.salary = { $gte: 700, $lte: 1000 };
      else if (priceRange === "1000+") query.salary = { $gte: 1000 };
    }

    // 7. Availability 
    if (availableNow === "true") {
      query.availability = true;
    }

    // Sorting
    let sortOptions = {};
    if (sortRating === 'desc') sortOptions.averageRating = -1;
    else if (sortRating === 'asc') sortOptions.averageRating = 1;

    if (sortPrice === 'desc') sortOptions.salary = -1;
    else if (sortPrice === 'asc') sortOptions.salary = 1;

    const workers = await WorkerProfile.find(query)
      .populate("userId", "name email")
      .sort(sortOptions);

    res.json(workers);
  } catch (err) {
    console.error("[getAllWorkers] Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// Get Distinct Categories
exports.getCategories = async (req, res) => {
  try {
    const BASE_CATEGORIES = [
      "Electrician",
      "Plumber",
      "Carpenter",
      "Painter",
      "AC Technician",
      "Mechanic",
      "Welder",
      "House Cleaner",
      "Construction Worker",
      "Tile Worker",
      "Driver",
      "Gardener",
      "Mason"
    ];

    const dbCategories = await WorkerProfile.distinct("jobCategory");

    // Merge and remove duplicates, filter out empty strings
    const allCategories = Array.from(new Set([...BASE_CATEGORIES, ...dbCategories]))
      .filter(c => !!c)
      .sort();

    res.json(allCategories);
  } catch (err) {
    console.error("[getCategories] Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Controller to fetch jobs for a worker
exports.getJobs = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "Missing userId in query" });
    }

    // Convert string userId to ObjectId
    const workerId = new mongoose.Types.ObjectId(userId);

    // Find jobs assigned to this worker
    const jobs = await Job.find({ assignedTo: workerId });

    if (!jobs || jobs.length === 0) {
      // Return empty array instead of 404 to avoid frontend errors
      return res.status(200).json([]);
    }

    res.status(200).json(jobs);
  } catch (err) {
    console.error("Error fetching jobs:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
