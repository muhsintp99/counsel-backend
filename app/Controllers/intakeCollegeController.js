const mongoose = require('mongoose');
const IntakeCollege = require('../models/intakeCollege.js');

// ✅ Auto-update status if deadline passed
exports.updateStatusIfDeadlinePassed = async () => {
  const today = new Date();
  await IntakeCollege.updateMany(
    {
      deadlineDate: { $lte: today },
      status: { $ne: 'closed' },
      isDeleted: false,
    },
    { $set: { status: 'closed' } }
  );
};

// ✅ Create Intake
exports.createIntake = async (req, res) => {
  try {
    const {
      college,
      intakeMonth,
      intakeYear,
      deadlineDate,
      status,
      visible,
      isDomestic,
    } = req.body;

    const validationErrors = [];

    if (!college || !mongoose.Types.ObjectId.isValid(college)) {
      validationErrors.push('Valid college ID is required.');
    }
    if (!intakeMonth || intakeMonth.trim() === '') {
      validationErrors.push('Intake month is required.');
    }
    if (!intakeYear || isNaN(intakeYear)) {
      validationErrors.push('Valid intake year is required.');
    }
    if (!deadlineDate || isNaN(Date.parse(deadlineDate))) {
      validationErrors.push('Valid deadline date is required.');
    }
    if (status && !['open', 'closed'].includes(status)) {
      validationErrors.push('Status must be "open" or "closed".');
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: validationErrors });
    }

    const intakeData = {
      college: new mongoose.Types.ObjectId(college),
      intakeMonth: intakeMonth.trim(),
      intakeYear: parseInt(intakeYear),
      deadlineDate: new Date(deadlineDate),
      status: status || 'open',
      visible: visible !== undefined ? visible : true,
      isDomestic: isDomestic !== undefined ? isDomestic : true,
      createdBy: req.user?._id || null,
    };

    const newIntake = new IntakeCollege(intakeData);
    const saved = await newIntake.save();

    const populated = await IntakeCollege.findById(saved._id).populate({
      path: 'college',
      match: { isDeleted: false },
      select: '-__v -createdBy -updatedBy -isDeleted -createdAt -updatedAt',
    });

    res.status(201).json({ success: true, message: 'Intake created successfully', data: populated });
  } catch (error) {
    console.error('Create Intake Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get All Intakes (supports ?domestic=true)
exports.getAllIntakes = async (req, res) => {
  try {
    const { domestic } = req.query;
    const filter = { isDeleted: false };

    if (domestic === 'true' || domestic === 'false') {
      filter.isDomestic = domestic === 'true';
    }

    const intakes = await IntakeCollege.find(filter)
      .populate({
        path: 'college',
        match: { isDeleted: false },
        select: '-__v -createdBy -updatedBy -isDeleted -createdAt -updatedAt',
      })
      .sort({ createdAt: -1, intakeYear: -1, intakeMonth: 1 });

    res.json({ success: true, count: intakes.length, data: intakes });
  } catch (error) {
    console.error('Get All Intakes Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get Intake by ID
exports.getIntakeById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid intake ID format' });
    }

    const intake = await IntakeCollege.findOne({ _id: id, isDeleted: false }).populate({
      path: 'college',
      match: { isDeleted: false },
      select: '-__v -createdBy -updatedBy -isDeleted -createdAt -updatedAt',
    });

    if (!intake) {
      return res.status(404).json({ success: false, message: 'Intake not found' });
    }

    res.json({ success: true, data: intake });
  } catch (error) {
    console.error('Get Intake By ID Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Update Intake
exports.updateIntake = async (req, res) => {
  try {
    const {
      college,
      intakeMonth,
      intakeYear,
      deadlineDate,
      status,
      visible,
      isDomestic,
    } = req.body;

    if (college && !mongoose.Types.ObjectId.isValid(college)) {
      return res.status(400).json({ success: false, message: 'Valid college ID is required' });
    }

    const updateData = {
      updatedAt: new Date(),
      updatedBy: req.user?._id || null,
    };

    if (college) updateData.college = new mongoose.Types.ObjectId(college);
    if (intakeMonth) updateData.intakeMonth = intakeMonth.trim();
    if (intakeYear) updateData.intakeYear = parseInt(intakeYear);
    if (deadlineDate) updateData.deadlineDate = new Date(deadlineDate);
    if (status) updateData.status = status;
    if (visible !== undefined) updateData.visible = visible;
    if (isDomestic !== undefined) updateData.isDomestic = isDomestic;

    const intake = await IntakeCollege.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      updateData,
      { new: true, runValidators: true }
    ).populate({
      path: 'college',
      match: { isDeleted: false },
      select: '-__v -createdBy -updatedBy -isDeleted -createdAt -updatedAt',
    });

    if (!intake) {
      return res.status(404).json({ success: false, message: 'Intake not found' });
    }

    res.json({ success: true, message: 'Intake updated successfully', data: intake });
  } catch (error) {
    console.error('Update Intake Error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// ✅ Soft Delete Intake
exports.deleteIntake = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid intake ID format' });
    }

    const intake = await IntakeCollege.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      {
        isDeleted: true,
        visible: false,
        deletedAt: new Date(),
        deletedBy: req.user?._id || null,
      },
      { new: true }
    );

    if (!intake) {
      return res.status(404).json({ success: false, message: 'Intake not found' });
    }

    res.json({ success: true, message: 'Intake deleted successfully', data: intake });
  } catch (error) {
    console.error('Delete Intake Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Hard Delete Intake
exports.hardDeleteIntake = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid intake ID format' });
    }

    const intake = await IntakeCollege.findByIdAndDelete(req.params.id);

    if (!intake) {
      return res.status(404).json({ success: false, message: 'Intake not found' });
    }

    res.json({ success: true, message: 'Intake permanently deleted', id: req.params.id });
  } catch (error) {
    console.error('Hard Delete Intake Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Intake Count
exports.getIntakeCount = async (req, res) => {
  try {
    const count = await IntakeCollege.countDocuments({ isDeleted: false });
    res.json({ success: true, count });
  } catch (error) {
    console.error('Get Intake Count Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
