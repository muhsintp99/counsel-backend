const express = require('express');
const enquiryController = require('../Controllers/enquiry'); 

const router = express.Router();

// Create a new enquiry
router.post('/', enquiryController.CreateEnquiryController);

// Get all enquiries
router.get('/', enquiryController.GetAllEnquiriesController);

// Get enquiry count (place this before `/:id` route)
router.get('/total/count', enquiryController.enquiryCount);

// Get a single enquiry by ID
router.get('/:id', enquiryController.GetSingleEnquiryController);

// Update an existing enquiry by ID
router.put('/:id', enquiryController.UpdateEnquiryController);

// Soft delete an enquiry by ID
router.patch('/:id', enquiryController.softDelete);

module.exports = router;
