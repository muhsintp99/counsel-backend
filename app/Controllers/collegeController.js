// const fs = require('fs');
// const path = require('path');
// const mongoose = require('mongoose');
// const College = require('../models/college');

// // =====================================================
// // Utility: Safe JSON parsing
// // =====================================================
// const safeParseJSON = (value, fieldName, fallback = []) => {
//   if (!value) return fallback;
//   if (Array.isArray(value)) return value;
//   try {
//     const parsed = JSON.parse(value);
//     return Array.isArray(parsed) ? parsed : fallback;
//   } catch {
//     console.warn(`⚠️ Failed to parse ${fieldName}:`, value);
//     return fallback;
//   }
// };

// // =====================================================
// // CREATE COLLEGE
// // =====================================================
// exports.createCollege = async (req, res) => {
//   try {
//     const {
//       name,
//       email,
//       phone,
//       address,
//       website,
//       desc,
//       category,
//       status,
//       country,
//       state,
//       courses,
//       visible,
//       isDomestic,
//       createdBy,
//     } = req.body;

//     // Duplicate name check
//     const existingCollege = await College.findOne({
//       name: { $regex: `^${name}$`, $options: 'i' },
//     });
//     if (existingCollege)
//       return res.status(400).json({ error: 'College name already exists' });

//     // Parse arrays safely
//     const parsedCategory = safeParseJSON(category, 'category');
//     const parsedCourses = safeParseJSON(courses, 'courses');

//     // Handle image upload
//     const image = req.file
//       ? `${req.protocol}://${req.get('host')}/public/college/${req.file.filename}`
//       : null;

//     // Boolean conversion for isDomestic
//     const domesticFlag =
//       typeof isDomestic === 'string'
//         ? isDomestic.toLowerCase() === 'true'
//         : !!isDomestic;

//     const newCollege = new College({
//       name,
//       email,       // no validation
//       phone,       // no validation
//       address,     // no validation
//       website,     // no validation
//       desc,
//       category: parsedCategory,
//       status,
//       country,
//       state,
//       courses: parsedCourses,
//       image,
//       visible: visible !== undefined ? JSON.parse(visible) : true,
//       isDomestic: domesticFlag,
//       createdBy: createdBy || 'admin',
//       updatedBy: createdBy || 'admin',
//     });

//     const saved = await newCollege.save();
//     const populated = await saved.populate('country state courses');
//     res.status(201).json(populated);
//   } catch (err) {
//     console.error('❌ Create college error:', err);
//     res.status(500).json({ error: err.message });
//   }
// };

// // =====================================================
// // GET ALL COLLEGES (with optional isDomestic filter)
// // =====================================================
// exports.getColleges = async (req, res) => {
//   try {
//     const { page = 1, limit = 10, isDomestic } = req.query;
//     const skip = (page - 1) * limit;

//     const pipeline = [
//       {
//         $lookup: {
//           from: 'countries',
//           localField: 'country',
//           foreignField: '_id',
//           as: 'country'
//         }
//       },
//       { $unwind: { path: '$country', preserveNullAndEmptyArrays: true } },
//       {
//         $lookup: {
//           from: 'states',
//           localField: 'state',
//           foreignField: '_id',
//           as: 'state'
//         }
//       },
//       { $unwind: { path: '$state', preserveNullAndEmptyArrays: true } },
//       {
//         $lookup: {
//           from: 'courses',
//           localField: 'courses',
//           foreignField: '_id',
//           as: 'courses'
//         }
//       },
//       {
//         $addFields: {
//           computedIsDomestic: {
//             $cond: [
//               { $ifNull: ['$isDomestic', false] },
//               '$isDomestic',
//               {
//                 $or: [
//                   '$country.isDomestic',
//                   { $in: [true, '$courses.isDomestic'] }
//                 ]
//               }
//             ]
//           }
//         }
//       }
//     ];

//     if (isDomestic === 'true') {
//       pipeline.push({ $match: { computedIsDomestic: true } });
//     } else if (isDomestic === 'false') {
//       pipeline.push({ $match: { computedIsDomestic: false } });
//     }

//     // Pagination
//     pipeline.push(
//       { $sort: { createdAt: -1 } },
//       { $skip: parseInt(skip) },
//       { $limit: parseInt(limit) }
//     );

//     const colleges = await College.aggregate(pipeline);

//     // Count total (without pagination)
//     const countPipeline = pipeline.filter(
//       stage => !('$skip' in stage || '$limit' in stage)
//     );
//     countPipeline.push({ $count: 'count' });
//     const totalResult = await College.aggregate(countPipeline);
//     const total = totalResult[0]?.count || 0;

//     res.status(200).json({
//       colleges,
//       totalPages: Math.ceil(total / limit),
//       currentPage: parseInt(page),
//       total,
//     });
//   } catch (error) {
//     console.error('❌ Error fetching colleges:', error);
//     res.status(500).json({
//       message: 'Failed to fetch colleges',
//       error: error.message,
//     });
//   }
// };

// // =====================================================
// // GET COLLEGE BY ID
// // =====================================================
// exports.getCollegeById = async (req, res) => {
//   try {
//     const college = await College.findById(req.params.id).populate(
//       'country state courses'
//     );

//     if (!college) return res.status(404).json({ error: 'College not found' });

//     const isDomesticFlag =
//       college.isDomestic ??
//       college.country?.isDomestic ??
//       college.courses?.some((c) => c.isDomestic === true) ??
//       false;

//     res.json({ ...college.toObject(), isDomestic: isDomesticFlag });
//   } catch (err) {
//     console.error('❌ Get college by ID error:', err);
//     res.status(500).json({ error: err.message });
//   }
// };

// // =====================================================
// // UPDATE COLLEGE
// // =====================================================
// exports.updateCollege = async (req, res) => {
//   try {
//     const {
//       name,
//       email,
//       phone,
//       address,
//       website,
//       desc,
//       category,
//       status,
//       country,
//       state,
//       courses,
//       visible,
//       isDomestic,
//       updatedBy,
//     } = req.body;

//     const college = await College.findById(req.params.id);
//     if (!college) return res.status(404).json({ error: 'College not found' });

//     // Duplicate name check
//     if (name && name.toLowerCase() !== college.name.toLowerCase()) {
//       const existingCollege = await College.findOne({
//         name: { $regex: `^${name}$`, $options: 'i' },
//       });
//       if (existingCollege)
//         return res.status(400).json({ error: 'College name already exists' });
//     }

//     const parsedCategory = safeParseJSON(category, 'category');
//     const parsedCourses = safeParseJSON(courses, 'courses');

//     const domesticFlag =
//       typeof isDomestic === 'string'
//         ? isDomestic.toLowerCase() === 'true'
//         : isDomestic ?? college.isDomestic;

//     // Handle image update
//     let image = college.image;
//     if (req.file) {
//       if (college.image) {
//         const oldPath = path.join(
//           __dirname,
//           '../../public/college',
//           path.basename(college.image)
//         );
//         if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
//       }
//       image = `${req.protocol}://${req.get('host')}/public/college/${req.file.filename}`;
//     }

//     const updateData = {
//       name: name || college.name,
//       email: email || college.email,
//       phone: phone || college.phone,
//       address: address || college.address,
//       website: website || college.website,
//       desc: desc || college.desc,
//       category: parsedCategory.length ? parsedCategory : college.category,
//       status: status || college.status,
//       country: country || college.country,
//       state: state || college.state,
//       courses: parsedCourses.length ? parsedCourses : college.courses,
//       image,
//       visible: visible !== undefined ? JSON.parse(visible) : college.visible,
//       isDomestic: domesticFlag,
//       updatedBy: updatedBy || 'admin',
//     };

//     const updated = await College.findByIdAndUpdate(
//       req.params.id,
//       updateData,
//       { new: true }
//     ).populate('country state courses');

//     res.json(updated);
//   } catch (err) {
//     console.error('❌ Update college error:', err);
//     res.status(500).json({ error: err.message });
//   }
// };

// // =====================================================
// // DELETE COLLEGE
// // =====================================================
// exports.deleteCollege = async (req, res) => {
//   try {
//     const college = await College.findById(req.params.id);
//     if (!college) return res.status(404).json({ error: 'College not found' });

//     if (college.image) {
//       const imagePath = path.join(
//         __dirname,
//         '../../public/college',
//         path.basename(college.image)
//       );
//       if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
//     }

//     await College.findByIdAndDelete(req.params.id);
//     res.json({ message: 'College permanently deleted' });
//   } catch (err) {
//     console.error('❌ Delete college error:', err);
//     res.status(500).json({ error: err.message });
//   }
// };

// exports.softDeleteCollege = async (req, res) => {
//   try {
//     const updated = await College.findByIdAndUpdate(
//       req.params.id,
//       { deleted: true },
//       { new: true }
//     );
//     res.status(200).json(updated);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };


// // =====================================================
// // COUNT
// // =====================================================
// exports.getCollegeCount = async (req, res) => {
//   try {
//     const count = await College.countDocuments();
//     res.json({ count });
//   } catch (err) {
//     console.error('❌ Get college count error:', err);
//     res.status(500).json({ error: err.message });
//   }
// };


const fs = require('fs');
const path = require('path');
const College = require('../models/college');

// Safe JSON parse helper
const safeParseJSON = (value, fieldName, fallback = []) => {
  if (!value) return fallback;
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    console.warn(`⚠️ Failed to parse ${fieldName}:`, value);
    return fallback;
  }
};

// Helper to normalize boolean values
const parseBoolean = (val, defaultValue = false) => {
  if (val === undefined || val === null) return defaultValue;
  if (typeof val === 'boolean') return val;
  if (typeof val === 'string') return val.toLowerCase() === 'true';
  return Boolean(val);
};

// CREATE
exports.createCollege = async (req, res) => {
  try {
    const {
      name, email, phone, address, website, desc,
      category, status, country, state, courses,
      visible, isDomestic
    } = req.body;

    const exists = await College.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
    if (exists) return res.status(400).json({ error: 'College name already exists' });

    const parsedCategory = safeParseJSON(category, 'category');
    const parsedCourses = safeParseJSON(courses, 'courses');

    const image = req.file
      ? `${req.protocol}://${req.get('host')}/public/college/${req.file.filename}`
      : null;

    const newCollege = new College({
      name, email, phone, address, website, desc,
      category: parsedCategory,
      status, country, state, courses: parsedCourses,
      image,
      visible: parseBoolean(visible, true),
      isDomestic: parseBoolean(isDomestic, true), // ✅ always boolean
    });

    const saved = await newCollege.save();
    const populated = await saved.populate('country state courses');
    res.status(201).json(populated);
  } catch (err) {
    console.error('❌ Create College Error:', err);
    res.status(500).json({ error: err.message });
  }
};

// GET ALL
exports.getColleges = async (req, res) => {
  try {
    const { page = 1, limit = 10, isDomestic } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (isDomestic === 'true') query.isDomestic = true;
    if (isDomestic === 'false') query.isDomestic = false;

    const colleges = await College.find(query)
      .populate('country state courses')
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await College.countDocuments(query);

    res.status(200).json({
      colleges,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
    });
  } catch (err) {
    console.error('❌ Get Colleges Error:', err);
    res.status(500).json({ error: err.message });
  }
};

// GET BY ID
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
    const college = await College.findById(req.params.id);
    if (!college) return res.status(404).json({ error: 'College not found' });

    const {
      name, email, phone, address, website, desc,
      category, status, country, state, courses,
      visible, isDomestic
    } = req.body;

    const parsedCategory = safeParseJSON(category, 'category');
    const parsedCourses = safeParseJSON(courses, 'courses');

    let image = college.image;
    if (req.file) {
      if (college.image) {
        const oldPath = path.join(__dirname, '../../public/college', path.basename(college.image));
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      image = `${req.protocol}://${req.get('host')}/public/college/${req.file.filename}`;
    }

    const updated = await College.findByIdAndUpdate(req.params.id, {
      name: name || college.name,
      email: email || college.email,
      phone: phone || college.phone,
      address: address || college.address,
      website: website || college.website,
      desc: desc || college.desc,
      category: parsedCategory.length ? parsedCategory : college.category,
      status: status || college.status,
      country: country || college.country,
      state: state || college.state,
      courses: parsedCourses.length ? parsedCourses : college.courses,
      image,
      visible: visible !== undefined ? parseBoolean(visible, college.visible) : college.visible,
      isDomestic: isDomestic !== undefined ? parseBoolean(isDomestic, college.isDomestic) : college.isDomestic,
    }, { new: true }).populate('country state courses');

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
