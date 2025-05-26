const College = require('../models/college');

// Create a new college
exports.createCollege = async (req, res) => {
  try {
    const {
      name, code, map, category, status, facility, service,
      country, courses
    } = req.body;

    const image = req.file ? `/public/college/${req.file.filename}` : null;
    // if (!image) return res.status(400).json({ error: 'Image is required.' });

    const newCollege = new College({
      name,
      map,
      code,
      category,
      status,
      facility,
      service,
      country,
      courses,
      image,
      createdBy: 'admin',
      updatedBy: 'admin'
    });

    const saved = await newCollege.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all colleges
exports.getColleges = async (req, res) => {
  try {
    const colleges = await College.find({ isDeleted: false })
      .populate({
        path: 'country',
        match: { isDeleted: false },
        select: '-__v -createdBy -updatedBy -isDeleted -createdAt -updatedAt'
      })
      .populate({
        path: 'courses',
        match: { isDeleted: false },
        select: '-__v -createdBy -updatedBy -isDeleted -createdAt -updatedAt'
      });

    res.json(colleges);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Get single college
exports.getCollegeById = async (req, res) => {
  try {
    const college = await College.findOne({ _id: req.params.id, isDeleted: false })
      .populate({
        path: 'country',
        match: { isDeleted: false },
        select: '-__v -createdBy -updatedBy -isDeleted -createdAt -updatedAt'
      })
      .populate({
        path: 'courses',
        match: { isDeleted: false },
        select: '-__v -createdBy -updatedBy -isDeleted -createdAt -updatedAt'
      });

    if (!college) return res.status(404).json({ error: 'College not found' });
    res.json(college);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Update college
exports.updateCollege = async (req, res) => {
  try {
    const {
      name, map, category, status, facility, service,
      country, courses, updatedBy
    } = req.body;

    const image = req.file ? `/public/college/${req.file.filename}` : undefined;

    const updateData = {
      name, map, category, status, facility, service,
      country, courses, updatedBy
    };

    if (image) updateData.image = image;

    const updated = await College.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Soft delete college
exports.softDeleteCollege = async (req, res) => {
  try {
    const deleted = await College.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
    res.json({ message: 'College deleted', data: deleted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
