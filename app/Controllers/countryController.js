// const Country = require('../models/country');
// const { v2: cloudinary } = require('cloudinary');

// // Create a new country
// exports.createCountry = async (req, res) => {
//   try {
//     const { name, code, isoCode, dialCode, currency } = req.body;

//     const image = req.file ? req.file.path : null;
//     const publicId = req.file ? req.file.filename : null;

//     if (!req.user?._id) {
//       return res.status(401).json({ success: false, message: 'Authentication required.' });
//     }

//     const newCountry = new Country({
//       name,
//       code,
//       isoCode,
//       dialCode,
//       currency,
//       image,
//       publicId,
//       createdBy: req.user._id,
//       updatedBy: req.user._id
//     });

//     const savedCountry = await newCountry.save();
//     res.status(201).json({ success: true, message: ' Create Successfully!', data: savedCountry });
//   } catch (err) {
//     res.status(400).json({ success: false, error: err.message });
//   }
// };

// // Get all countries (excluding deleted)
// exports.getAllCountries = async (req, res) => {
//   try {
//     const countries = await Country.find({ isDeleted: false }).sort({ createdAt: -1 });
//     const total = await Country.countDocuments({ isDeleted: false });
//     res.json({ success: true, total, data: countries });
//   } catch (err) {
//     res.status(500).json({ success: false, error: err.message });
//   }
// };

// // Get country by ID
// exports.getCountryById = async (req, res) => {
//   try {
//     const country = await Country.findById(req.params.id);
//     if (!country || country.isDeleted) {
//       return res.status(404).json({ success: false, error: 'Country not found' });
//     }
//     res.json({ success: true, data: country });
//   } catch (err) {
//     res.status(500).json({ success: false, error: err.message });
//   }
// };

// // Update country
// exports.updateCountry = async (req, res) => {
//   try {
//     const { name, code, isoCode, dialCode, currency } = req.body;

//     const image = req.file ? req.file.path : null;
//     const publicId = req.file ? req.file.filename : null;

//     if (!req.user?._id) {
//       return res.status(401).json({ success: false, message: 'Authentication required.' });
//     }

//     const updatedFields = {
//       name,
//       code,
//       isoCode,
//       dialCode,
//       currency,
//       updatedBy: req.user._id
//     };

//     if (image) {
//       updatedFields.image = image;
//       updatedFields.publicId = publicId;
//     }

//     const updatedCountry = await Country.findByIdAndUpdate(
//       req.params.id,
//       updatedFields,
//       { new: true, runValidators: true }
//     );

//     if (!updatedCountry) {
//       return res.status(404).json({ success: false, message: 'Country not found' });
//     }

//     res.json({ success: true, message: 'Update Successfully!', data: updatedCountry });
//   } catch (err) {
//     res.status(400).json({ success: false, error: err.message });
//   }
// };


// // Get total country count (excluding deleted)
// exports.getCountryCount = async (req, res) => {
//   try {
//     const total = await Country.countDocuments({ isDeleted: false });
//     res.json({ success: true, total });
//   } catch (err) {
//     res.status(500).json({ success: false, error: err.message });
//   }
// };

// // Hard delete country
// exports.deleteCountry = async (req, res) => {
//   try {
//     const country = await Country.findById(req.params.id);

//     if (!country) {
//       return res.status(404).json({ success: false, message: 'Country not found' });
//     }

//     if (country.publicId) {
//       await cloudinary.uploader.destroy(country.publicId);
//     }

//     await Country.findByIdAndDelete(req.params.id);

//     res.json({
//       success: true,
//       message: 'Country permanently deleted',
//       data: country
//     });

//   } catch (err) {
//     res.status(500).json({ success: false, error: err.message });
//   }
// };
// ----------------------------------------------------------------------------------------

const Country = require('../models/country');
const fs = require('fs');
const path = require('path');

// Helper to create full image URL
const formatImageUrl = (req, imagePath) => {
  if (!imagePath) return null;
  return `${req.protocol}://${req.get('host')}${imagePath}`;
};


// Create a new country
exports.createCountry = async (req, res) => {
  try {
    const { name, code, isoCode, dialCode, currency } = req.body;

    const image = req.file ? `/public/country/${req.file.filename}` : '/public/default/picture.png';

    const newCountry = new Country({
      name,
      code,
      isoCode,
      dialCode,
      currency,
      image,
      createdBy: req.user?._id || 'admin',
      updatedBy: req.user?._id || 'admin'
    });

    const savedCountry = await newCountry.save();

    res.status(201).json({
      success: true,
      message: 'Created successfully',
      data: {
        ...savedCountry.toObject(),
        image: formatImageUrl(req, savedCountry.image)
      }
    });

  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};


// Get all countries
exports.getAllCountries = async (req, res) => {
  try {
    const countries = await Country.find({ isDeleted: false }).sort({ createdAt: -1 });

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const result = countries.map((country) => ({
      ...country.toObject(),
      image: formatImageUrl(req, country.image)
    }));

    res.json({ success: true, total: result.length, data: result });
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

    const dataWithImageUrl = {
      ...country.toObject(),
      image: formatImageUrl(req, country.image)
    };

    res.json({ success: true, data: dataWithImageUrl });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Update country
exports.updateCountry = async (req, res) => {
  try {
    const { name, code, isoCode, dialCode, currency } = req.body;
    const country = await Country.findById(req.params.id);

    if (!country || country.isDeleted) {
      return res.status(404).json({ success: false, message: 'Country not found' });
    }

    // Delete old image if a new one is uploaded
    if (req.file && country.image && country.image !== '/public/default/picture.png') {
      const oldImagePath = path.join(__dirname, '../../', country.image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    const updatedFields = {
      name,
      code,
      isoCode,
      dialCode,
      currency,
      updatedBy: req.user?._id || 'admin'
    };

    if (req.file) {
      updatedFields.image = `/public/country/${req.file.filename}`;
    }

    const updatedCountry = await Country.findByIdAndUpdate(
      req.params.id,
      updatedFields,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Updated successfully',
      data: {
        ...updatedCountry.toObject(),
        image: formatImageUrl(req, updatedCountry.image)
      }
    });

  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};


// Get total country count
exports.getCountryCount = async (req, res) => {
  try {
    const total = await Country.countDocuments({ isDeleted: false });
    res.json({ success: true, total });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Hard delete country (with image removal)
exports.deleteCountry = async (req, res) => {
  try {
    const country = await Country.findById(req.params.id);

    if (!country) {
      return res.status(404).json({ success: false, message: 'Country not found' });
    }

    // Delete image if not default
    if (country.image && country.image !== '/public/defult/picture.png') {
      const imagePath = path.join(__dirname, '../../', country.image);
      fs.unlink(imagePath, err => {
        if (err) console.error('Error deleting image:', err.message);
      });
    }

    await Country.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Country permanently deleted',
      data: {
        ...country.toObject(),
        image: formatImageUrl(req, country.image)
      }
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
