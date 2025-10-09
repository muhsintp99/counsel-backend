const State = require('../models/state');
const Country = require('../models/country');

// Create State
exports.createState = async (req, res) => {
  try {
    const { name, code, desc, country, isActive, recommend } = req.body;

    // Validate country existence
    const countryExists = await Country.findById(country);
    if (!countryExists) {
      return res.status(404).json({ success: false, message: 'Country not found' });
    }

    const state = new State({
      name,
      code,
      desc,
      country,
      isActive: isActive ?? true,
      recommend: recommend ?? false
    });

    const saved = await state.save();
    const populated = await saved.populate('country', 'name code');

    return res.status(201).json({
      success: true,
      message: 'State created successfully!',
      data: populated
    });
  } catch (error) {
    console.error('❌ Create State Error:', error);
    return res.status(400).json({ success: false, error: error.message });
  }
};

// Get All States
exports.getAllStates = async (req, res) => {
  try {
    // Fetch states with populated country field
    const states = await State.find()
      .populate('country', 'name code')
      .sort({ createdAt: -1 })
      .lean();

    // Filter out entries where country is null (in case deleted country remains)
    const filtered = states.filter((state) => state.country !== null);

    return res.json({
      success: true,
      total: filtered.length,
      data: filtered
    });
  } catch (error) {
    console.error('❌ Get All States Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Get Single State
exports.getStateById = async (req, res) => {
  try {
    const state = await State.findById(req.params.id)
      .populate('country', 'name code');

    if (!state) {
      return res.status(404).json({ success: false, message: 'State not found' });
    }

    if (!state.country) {
      return res.status(404).json({ success: false, message: 'Country data missing or deleted' });
    }

    return res.json({ success: true, data: state });
  } catch (error) {
    console.error('❌ Get State Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Update State
exports.updateState = async (req, res) => {
  try {
    const { name, code, desc, country, isActive, recommend } = req.body;

    // Validate country if provided
    if (country) {
      const countryExists = await Country.findById(country);
      if (!countryExists) {
        return res.status(404).json({ success: false, message: 'Country not found' });
      }
    }

    const updated = await State.findByIdAndUpdate(
      req.params.id,
      { name, code, desc, country, isActive, recommend },
      { new: true, runValidators: true }
    ).populate('country', 'name code');

    if (!updated) {
      return res.status(404).json({ success: false, message: 'State not found' });
    }

    return res.json({
      success: true,
      message: 'State updated successfully!',
      data: updated
    });
  } catch (error) {
    console.error('❌ Update State Error:', error);
    return res.status(400).json({ success: false, error: error.message });
  }
};

// Delete State (Hard Delete)
exports.deleteState = async (req, res) => {
  try {
    const deleted = await State.findByIdAndDelete(req.params.id)
      .populate('country', 'name code');

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'State not found' });
    }

    return res.json({
      success: true,
      message: 'State deleted successfully!',
      data: deleted
    });
  } catch (error) {
    console.error('❌ Delete State Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Get State Count
exports.getStateCount = async (req, res) => {
  try {
    const count = await State.countDocuments();
    return res.json({ success: true, count });
  } catch (error) {
    console.error('❌ State Count Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
