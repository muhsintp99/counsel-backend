const Country = require('../models/country');

// Create a new country
exports.createCountry = async (req, res) => {
  try {
    const newCountry = new Country(req.body);
    const savedCountry = await newCountry.save();
    res.status(201).json(savedCountry);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all countries (excluding deleted)
exports.getAllCountries = async (req, res) => {
  try {
    const countries = await Country.find({ isDeleted: false });
    res.json(countries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get country by ID
exports.getCountryById = async (req, res) => {
  try {
    const country = await Country.findById(req.params.id);
    if (!country || country.isDeleted) {
      return res.status(404).json({ error: 'Country not found' });
    }
    res.json(country);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update country
exports.updateCountry = async (req, res) => {
  try {
    const updatedCountry = await Country.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: 'admin' },
      { new: true }
    );
    res.json(updatedCountry);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Soft delete country
exports.deleteCountry = async (req, res) => {
  try {
    const deleted = await Country.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true, updatedBy: 'admin' },
      { new: true }
    );
    res.json({ message: 'Country soft deleted', data: deleted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
