const fs = require('fs');
const path = require('path');
const College = require('../models/college');

// Helper to safely parse arrays or JSON
const safeParseJSON = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

// Convert "true"/"false" → Boolean
const parseBoolean = (val, defaultValue = false) => {
  if (val === undefined || val === null) return defaultValue;
  if (typeof val === 'boolean') return val;
  return String(val).toLowerCase() === 'true';
};

// CREATE
exports.createCollege = async (req, res) => {
  try {
    const { name, isDomestic, ...rest } = req.body;

    if (!name) return res.status(400).json({ error: 'College name is required' });

    const existing = await College.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
    if (existing) return res.status(400).json({ error: 'College name already exists' });

    const image = req.file
      ? `${req.protocol}://${req.get('host')}/public/college/${req.file.filename}`
      : null;

    const college = new College({
      name,
      ...rest,
      image,
      category: safeParseJSON(rest.category),
      courses: safeParseJSON(rest.courses),
      isDomestic: parseBoolean(isDomestic, true),
    });

    const saved = await college.save();
    const populated = await saved.populate('country state courses');
    res.status(201).json(populated);
  } catch (err) {
    console.error('❌ Create College Error:', err);
    res.status(500).json({ error: err.message });
  }
};

// READ (ALL)
exports.getColleges = async (req, res) => {
  try {
    const { page = 1, limit = 10, isDomestic } = req.query;
    const query = {};

    if (isDomestic === 'true') query.isDomestic = true;
    if (isDomestic === 'false') query.isDomestic = false;

    const skip = (page - 1) * limit;

    const [colleges, total] = await Promise.all([
      College.find(query)
        .populate('country state courses')
        .skip(parseInt(skip))
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }),
      College.countDocuments(query),
    ]);

    res.json({
      colleges,
      pagination: {
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total,
      },
    });
  } catch (err) {
    console.error('❌ Get Colleges Error:', err);
    res.status(500).json({ error: err.message });
  }
};

// READ (BY ID)
exports.getCollegeById = async (req, res) => {
  try {
    const college = await College.findById(req.params.id).populate('country state courses');
    if (!college) return res.status(404).json({ error: 'College not found' });
    res.json(college);
  } catch (err) {
    console.error('❌ Get College By ID Error:', err);
    res.status(500).json({ error: err.message });
  }
};

// UPDATE
exports.updateCollege = async (req, res) => {
  try {
    const existing = await College.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'College not found' });

    const { name, isDomestic, ...rest } = req.body;

    // Check name duplication if changed
    if (name && name.toLowerCase() !== existing.name.toLowerCase()) {
      const duplicate = await College.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
      if (duplicate) return res.status(400).json({ error: 'College name already exists' });
    }

    let image = existing.image;
    if (req.file) {
      if (image) {
        const oldPath = path.join(__dirname, '../../public/college', path.basename(image));
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      image = `${req.protocol}://${req.get('host')}/public/college/${req.file.filename}`;
    }

    const updated = await College.findByIdAndUpdate(
      req.params.id,
      {
        ...rest,
        name: name || existing.name,
        image,
        category: safeParseJSON(rest.category).length ? safeParseJSON(rest.category) : existing.category,
        courses: safeParseJSON(rest.courses).length ? safeParseJSON(rest.courses) : existing.courses,
        isDomestic: isDomestic !== undefined ? parseBoolean(isDomestic, existing.isDomestic) : existing.isDomestic,
      },
      { new: true }
    ).populate('country state courses');

    res.json(updated);
  } catch (err) {
    console.error('❌ Update College Error:', err);
    res.status(500).json({ error: err.message });
  }
};

// DELETE
exports.deleteCollege = async (req, res) => {
  try {
    const college = await College.findById(req.params.id);
    if (!college) return res.status(404).json({ error: 'College not found' });

    if (college.image) {
      const imgPath = path.join(__dirname, '../../public/college', path.basename(college.image));
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    await College.findByIdAndDelete(req.params.id);
    res.json({ message: 'College deleted successfully' });
  } catch (err) {
    console.error('❌ Delete College Error:', err);
    res.status(500).json({ error: err.message });
  }
};

// COUNT
exports.getCollegeCount = async (req, res) => {
  try {
    const count = await College.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
