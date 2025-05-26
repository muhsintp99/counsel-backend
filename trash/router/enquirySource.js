const  express = require('express');
const enquirySourceController =require('../Controllers/enquirySource'); 

const router = express.Router();



// Create a new enquiry
router.post('/', enquirySourceController.CreateEnquirySourceController );

// Get all enquiries
router.get('/', enquirySourceController.GetAllEnquiriesSourceController);

// Update an existing enquiry by ID
router.put('/:id', enquirySourceController.UpdateEnquirySourceController );


// Get a single enquiry by ID
router.get('/:id', enquirySourceController.GetSingleEnquirySourceController);

// Delete an enquiry by ID
router.patch('/:id',enquirySourceController.softDeleteEnquirysource);

module.exports = router;