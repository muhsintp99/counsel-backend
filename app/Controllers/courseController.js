const Course = require('../models/course');
const fs = require('fs');
const path = require('path');

// Helper: Delete image safely
const deleteImage = (imageUrl) => {
  try {
    const fileName = path.basename(imageUrl);
    const imagePath = path.join(__dirname, `../../public/courses/${fileName}`);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  } catch (error) {
    console.error('Error deleting image:', error.message);
  }
};

// Create new course
exports.createCourse = async (req, res) => {
  try {
    const image = req.file
      ? `${req.protocol}://${req.get('host')}/public/courses/${req.file.filename}`
      : null;

    const courseData = {
      ...req.body,
      image,
    };

    const course = new Course(courseData);
    await course.save();

    res.status(201).json({
      message: 'Course created successfully',
      data: course,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get all courses
exports.getAllCourses = async (req, res) => {
  try {
    const isDomestic = req.query.domestic;
    const visible = req.query.visible;

    let filter = { isDeleted: false };

    if (visible !== undefined) filter.visible = visible === 'true';
    if (isDomestic === 'true' || isDomestic === 'false') {
      filter.isDomestic = isDomestic === 'true';
    }

    const courses = await Course.find(filter);
    const count = await Course.countDocuments(filter);

    res.json({
      message: 'Courses fetched successfully',
      data: courses,
      count,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get course by ID
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course || course.isDeleted) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json({
      message: 'Course fetched successfully',
      data: course,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update course
exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    // Delete old image if new one uploaded
    if (req.file && course.image) {
      deleteImage(course.image);
    }

    const image = req.file
      ? `${req.protocol}://${req.get('host')}/public/courses/${req.file.filename}`
      : course.image;

    const updatedData = {
      ...req.body,
      image,
    };

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      { $set: updatedData },
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Course updated successfully',
      data: updatedCourse,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete course (permanent delete)
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Delete image from folder if exists
    if (course.image) {
      deleteImage(course.image);
    }

    await Course.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Course permanently deleted',
      data: course,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
