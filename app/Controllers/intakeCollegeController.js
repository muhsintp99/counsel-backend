import IntakeCollege from '../models/intakeCollege.js';
import mongoose from 'mongoose';

// Auto-update status if deadline is passed
const updateStatusIfDeadlinePassed = async () => {
  const today = new Date();
  await IntakeCollege.updateMany(
    {
      deadlineDate: { $lte: today },
      status: { $ne: 'closed' }
    },
    { $set: { status: 'closed' } }
  );
};

// @desc    Create Intake
export const createIntake = async (req, res) => {
  try {
    const intake = await IntakeCollege.create(req.body);
    res.status(201).json(intake);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all visible Intakes
export const getAllIntakes = async (req, res) => {
  try {
    await updateStatusIfDeadlinePassed(); // auto close outdated

    const intakes = await IntakeCollege.find({ status: { $ne: 'closed' } })
      .populate('college')
      .sort({ intakeYear: -1 });

    res.json(intakes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single intake by ID
export const getIntakeById = async (req, res) => {
  try {
    const intake = await IntakeCollege.findById(req.params.id).populate('college');

    if (!intake) return res.status(404).json({ message: 'Intake not found' });

    res.json(intake);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update Intake
export const updateIntake = async (req, res) => {
  try {
    const intake = await IntakeCollege.findByIdAndUpdate(req.params.id, req.body, {
      new: true
    });

    if (!intake) return res.status(404).json({ message: 'Intake not found' });

    res.json(intake);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete Intake (Soft Delete)
export const deleteIntake = async (req, res) => {
  try {
    const intake = await IntakeCollege.findByIdAndUpdate(
      req.params.id,
      {
        deletedAt: new Date(),
        deletedBy: req.user ? req.user._id : null
      },
      { new: true }
    );

    if (!intake) return res.status(404).json({ message: 'Intake not found' });

    res.json({ message: 'Deleted successfully', intake });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Count of active intakes
export const getIntakeCount = async (req, res) => {
  try {
    await updateStatusIfDeadlinePassed();

    const count = await IntakeCollege.countDocuments({ status: { $ne: 'closed' } });
    res.json({ totalIntakes: count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
