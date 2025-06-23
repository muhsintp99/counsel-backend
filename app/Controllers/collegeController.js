const College = require('../models/college');
const Country = require('../models/country');

// Safe JSON parser
const safeParseJSON = (value, defaultValue = []) => {
  if (!value) return defaultValue;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch (err) {
      console.error(`JSON parse error: ${value}`, err);
      return defaultValue;
    }
  }
  if (Array.isArray(value)) return value;
  return defaultValue;
};

// Create college
exports.createCollege = async (req, res) => {
  try {
    const {
      name, code, email, phone, address, website, desc, map,
      category, status, facilities, services, country, courses,
      visible, createdBy
    } = req.body;

    const image = req.file?.path || null;

    const existingCollege = await College.findOne({ code, isDeleted: false });
    if (existingCollege) {
      return res.status(400).json({ error: 'College code already exists' });
    }

    const newCollege = new College({
      name,
      code,
      email,
      phone,
      address,
      website,
      desc,
      map,
      category,
      status,
      facilities: safeParseJSON(facilities),
      services: safeParseJSON(services),
      courses: safeParseJSON(courses),
      country,
      image,
      visible: visible !== undefined ? (typeof visible === 'string' ? JSON.parse(visible) : visible) : true,
      createdBy: createdBy || 'admin',
      updatedBy: createdBy || 'admin'
    });

    const saved = await newCollege.save();

    const populatedCollege = await College.findById(saved._id)
      .populate({ path: 'country', match: { isDeleted: false } })
      .populate({ path: 'courses', match: { isDeleted: false } });

    res.status(201).json(populatedCollege);
  } catch (err) {
    console.error('Create college error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get all colleges
exports.getColleges = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category, status, domestic } = req.query;
    const filter = { isDeleted: false };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { desc: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) filter.category = category;
    if (status) filter.status = status;

    if (domestic === 'true' || domestic === 'false') {
      const isDomesticValue = domestic === 'true';
      const countryDocs = await Country.find({ isDomestic: isDomesticValue, isDeleted: false }).select('_id');
      filter.country = { $in: countryDocs.map(c => c._id) };
    }

    const colleges = await College.find(filter)
      .populate({ path: 'country', match: { isDeleted: false } })
      .populate({ path: 'courses', match: { isDeleted: false } })
      .sort({ createdAt: -1 }) // Keep this for sorting by latest
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await College.countDocuments(filter);

    res.json({
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      colleges
    });
  } catch (err) {
    console.error('Get colleges error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get single college
exports.getCollegeById = async (req, res) => {
  try {
    const college = await College.findOne({ _id: req.params.id, isDeleted: false })
      .populate({ path: 'country', match: { isDeleted: false } })
      .populate({ path: 'courses', match: { isDeleted: false } });

    if (!college) return res.status(404).json({ error: 'College not found' });

    res.json(college);
  } catch (err) {
    console.error('Get college by ID error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Update college
exports.updateCollege = async (req, res) => {
  try {
    const {
      name, code, email, phone, address, website, desc, map,
      category, status, facilities, services, country, courses,
      visible, updatedBy
    } = req.body;

    const image = req.file?.path;

    if (code) {
      const existingCollege = await College.findOne({
        code,
        isDeleted: false,
        _id: { $ne: req.params.id }
      });
      if (existingCollege) {
        return res.status(400).json({ error: 'College code already exists' });
      }
    }

    const updateData = {
      ...(name && { name }),
      ...(code && { code }),
      ...(email !== undefined && { email }),
      ...(phone !== undefined && { phone }),
      ...(address !== undefined && { address }),
      ...(website !== undefined && { website }),
      ...(desc !== undefined && { desc }),
      ...(map !== undefined && { map }),
      ...(category && { category }),
      ...(status && { status }),
      ...(facilities && { facilities: safeParseJSON(facilities) }),
      ...(services && { services: safeParseJSON(services) }),
      ...(courses && { courses: safeParseJSON(courses) }),
      ...(country && { country }),
      ...(visible !== undefined && { visible: typeof visible === 'string' ? JSON.parse(visible) : visible }),
      updatedBy: updatedBy || 'admin'
    };

    if (image) updateData.image = image;

    const updated = await College.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate({ path: 'country', match: { isDeleted: false } })
      .populate({ path: 'courses', match: { isDeleted: false } });

    if (!updated) return res.status(404).json({ error: 'College not found' });

    res.json(updated);
  } catch (err) {
    console.error('Update college error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Soft delete college
exports.softDeleteCollege = async (req, res) => {
  try {
    const deleted = await College.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true, updatedBy: req.body.updatedBy || 'admin' },
      { new: true }
    );

    if (!deleted) return res.status(404).json({ error: 'College not found' });

    res.json({ message: 'College soft deleted successfully', data: deleted });
  } catch (err) {
    console.error('Soft delete error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Hard delete
exports.deleteCollege = async (req, res) => {
  try {
    const deleted = await College.findByIdAndDelete(req.params.id);

    if (!deleted) return res.status(404).json({ error: 'College not found' });

    res.json({ message: 'College permanently deleted', data: deleted });
  } catch (err) {
    console.error('Hard delete error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Count
exports.getCollegeCount = async (req, res) => {
  try {
    const count = await College.countDocuments({ isDeleted: false });
    res.json({ count });
  } catch (err) {
    console.error('College count error:', err);
    res.status(500).json({ error: err.message });
  }
};
