// courseController.js
const Course = require('../models/course');

exports.createCourse = async (req, res) => {
  try {
    const image = req.file ? req.file.path : null;

    const courseData = {
      ...req.body,
      image,
      createdBy: req.user?.role || 'admin',
      updatedBy: req.user?.role || 'admin'
    };

    const course = new Course(courseData);
    await course.save();

    res.status(201).json(course);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getAllCourses = async (req, res) => {
  try {
    const isDomestic = req.query.domestic;

    // Base filter
    const filter = { isDeleted: false };

    // Add isDomestic filter only if query is valid
    if (isDomestic === 'true' || isDomestic === 'false') {
      filter.isDomestic = isDomestic === 'true';
    }

    const courses = await Course.find(filter).sort({ createdAt: -1 });
    const count = await Course.countDocuments(filter);

    res.json({ message: 'Courses fetched', count, data: courses });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course || course.isDeleted) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const image = req.file ? req.file.path : null;

    const updatedData = {
      ...req.body,
      updatedBy: req.user?.role || 'admin',
    };

    if (image !== undefined) {
      updatedData.image = image;
    }

    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { $set: updatedData },
      { new: true, runValidators: true }
    );

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json(course);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { $set: { isDeleted: true } },
      { new: true }
    );

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json({ message: 'Course deleted', data: course });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};