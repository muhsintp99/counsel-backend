const Country = require('../models/country');

// Create a new country
exports.createCountry = async (req, res) => {
  try {
    const { name, code, isoCode, dialCode, currency } = req.body;
    const image = req.file ? `/public/country/${req.file.filename}` : undefined;

    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    // Define allowed fields, excluding isDomestic and isDefault
    // const allowedFields = ['name', 'code', 'isoCode', 'dialCode', 'currency'];
    // const filteredBody = {};
    // allowedFields.forEach(field => {
    //   if (req.body[field] !== undefined) {
    //     filteredBody[field] = req.body[field];
    //   }
    // });

    const newCountry = new Country({
      name,
      code,
      isoCode,
      dialCode,
      currency,
      image,
      createdBy: req.user._id,
      updatedBy: req.user._id
    });

    const savedCountry = await newCountry.save();
    res.status(201).json({ success: true,message: ' Create Successfully!', data: savedCountry });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get all countries (excluding deleted)
exports.getAllCountries = async (req, res) => {
  try {
    const countries = await Country.find({ isDeleted: false }).sort({ createdAt: -1 });
    const total = await Country.countDocuments({ isDeleted: false });
    res.json({ success: true, total, data: countries });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get country by ID
exports.getCountryById = async (req, res) => {
  try {
    const country = await Country.findById(req.params.id);
    if (!country || country.isDeleted) {
      return res.status(404).json({ success: false, error: 'Country not found' });
    }
    res.json({ success: true, data: country });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Update country
exports.updateCountry = async (req, res) => {
  try {
    const { name, code, isoCode, dialCode, currency } = req.body;
    const image = req.file ? `/public/country/${req.file.filename}` : undefined;

    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const updatedFields = {
      name,
      code,
      isoCode,
      dialCode,
      currency,
      updatedBy: req.user._id
    };

    if (image) {
      updatedFields.image = image;
    }

    const updatedCountry = await Country.findByIdAndUpdate(
      req.params.id,
      updatedFields,
      { new: true, runValidators: true }
    );

    if (!updatedCountry) {
      return res.status(404).json({ success: false, message: 'Country not found' });
    }

    res.json({ success: true, message: 'Update Successfully!',data: updatedCountry });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};


// Hard delete country
exports.deleteCountry = async (req, res) => {
  try {
    const deleted = await Country.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Country not found' });
    }

    res.json({ success: true, message: 'Country permanently deleted', data: deleted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};