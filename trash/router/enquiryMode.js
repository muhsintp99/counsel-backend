// routes/enquirymodeRoutes.js
const express = require('express');
const router = express.Router();
const enquiryModeController = require('../Controllers/enquiryMode');

router.post('/', enquiryModeController.createEnquiryModeController);
router.get('/', enquiryModeController.getAllEnquirymodesController);
router.get('/:id', enquiryModeController.getSingleEnquiryModeController);
router.put('/:id', enquiryModeController.updateEnquiryModeController);
router.patch('/:id', enquiryModeController.softDeleteEnquirymode);

module.exports = router;