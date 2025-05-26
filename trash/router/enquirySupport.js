const  express = require('express');
const enquirySupport =require('../Controllers/enquirySupport'); 

const router = express.Router();


// Create a new enquiry
router.post('/', enquirySupport.CreateEnquirySupport);

// Get all enquiries
router.get('/', enquirySupport.GetAllEnquirySupport);

// Update an existing enquiry by ID
router.put('/:id', enquirySupport.UpdateEnquirySupport);


//Soft  Delete an enquiry by ID
router.patch('/:id',enquirySupport.softDelete);


//get count

router.get('/support-count',enquirySupport.findTotalSupportCount);


// Get a single enquiry by ID
router.get('/:id', enquirySupport.GetSingleEnquirySupport);

module.exports = router;

