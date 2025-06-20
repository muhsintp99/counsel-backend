const State = require('../models/state');
const Country = require('../models/country');

// Create State
exports.createState = async (req, res) => {
  try {
    const { name, code, desc, country, index, isActive } = req.body;

    const countryExists = await Country.findById(country);
    if (!countryExists) {
      return res.status(404).json({ success: false, message: 'Country not found' });
    }

    const state = new State({
      name,
      code,
      desc,
      country,
      index,
      isActive: isActive !== undefined ? isActive : true
    });

    const saved = await state.save();
    res.status(201).json({ success: true, message: 'State created successfully!', data: saved });

  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get All States
exports.getAllStates = async (req, res) => {
  try {
    const states = await State.find({ deletedAt: null })
      .populate('country', 'name code')
      .sort({ index: 1, createdAt: -1 });

    const total = await State.countDocuments({ deletedAt: null });

    res.json({ success: true, total, data: states });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get State by ID
exports.getStateById = async (req, res) => {
  try {
    const state = await State.findOne({ _id: req.params.id, deletedAt: null })
      .populate('country', 'name code');

    if (!state) {
      return res.status(404).json({ success: false, message: 'State not found' });
    }

    res.json({ success: true, data: state });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update State
exports.updateState = async (req, res) => {
  try {
    const { name, code, desc, country, index, isActive } = req.body;

    const updated = await State.findByIdAndUpdate(
      req.params.id,
      {
        name,
        code,
        desc,
        country,
        index,
        isActive,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'State not found' });
    }

    res.json({ success: true, message: 'State updated successfully!', data: updated });

  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Soft Delete State
exports.deleteState = async (req, res) => {
  try {
    const deleted = await State.findByIdAndUpdate(
      req.params.id,
      {
        deletedAt: new Date()
      },
      { new: true }
    );

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'State not found' });
    }

    res.json({ success: true, message: 'State deleted (soft)', data: deleted });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


exports.getStateCount = async (req, res) => {
  try {
    const count = await State.countDocuments({ deletedAt: null });
    res.json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
