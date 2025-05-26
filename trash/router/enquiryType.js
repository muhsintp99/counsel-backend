const express = require("express");
const enquiryTypeController = require("../Controllers/enquiryType");

const router = express.Router();

// Create a new organization category
router.post("/", enquiryTypeController.CreateEnquiryType);

// Get all organization categories
router.get("/", enquiryTypeController.GetAllEnquiryTypes);

// Update an existing organization category by ID
router.put("/:id", enquiryTypeController.UpdateEnquiryType);

// Get a single organization category by ID
router.get("/:id", enquiryTypeController.GetSingleEnquiryType);

// Soft-delete an organization category by ID
router.patch("/:id", enquiryTypeController.softDeleteEnquiryType);

module.exports = router;
