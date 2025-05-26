const express = require('express');
const router = express.Router();
const countryController = require('../Controllers/countryController');

router.post('/', countryController.createCountry);
router.get('/', countryController.getAllCountries);
router.get('/:id', countryController.getCountryById);
router.put('/:id', countryController.updateCountry);
router.delete('/:id', countryController.deleteCountry);

module.exports = router;
