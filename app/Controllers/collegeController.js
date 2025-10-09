// const fs = require('fs');
// const path = require('path');
// const College = require('../models/college');

// // Safely parse JSON fields (e.g. arrays coming as strings from frontend)
// const safeParseJSON = (value, fallback = []) => {
//   try {
//     return value ? JSON.parse(value) : fallback;
//   } catch {
//     return fallback;
//   }
// };

// // CREATE
// exports.createCollege = async (req, res) => {
//   try {
//     const {
//       name, email, phone, address, website, desc, map,
//       category, status, facilities, services, country, state, courses, visible
//     } = req.body;

//     const existingCollege = await College.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
//     if (existingCollege) {
//       return res.status(400).json({ error: 'College name already exists' });
//     }

//     const image = req.file
//       ? `${req.protocol}://${req.get('host')}/public/college/${req.file.filename}`
//       : null;

//     const newCollege = new College({
//       name, email, phone, address, website, desc, map,
//       category: safeParseJSON(category),
//       status, country, state,
//       facilities: safeParseJSON(facilities),
//       services: safeParseJSON(services),
//       courses: safeParseJSON(courses),
//       image,
//       visible: visible !== undefined ? JSON.parse(visible) : true
//     });

//     const saved = await newCollege.save();
//     const populated = await saved.populate('country state courses');
//     res.status(201).json(populated);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // READ ALL
// exports.getColleges = async (req, res) => {
//   try {
//     const { page = 1, limit = 10, search, category, status, country, state } = req.query;
//     const filter = {};

//     if (search) {
//       filter.$or = [
//         { name: { $regex: search, $options: 'i' } },
//         { desc: { $regex: search, $options: 'i' } }
//       ];
//     }

//     if (category) filter.category = { $in: safeParseJSON(category) };
//     if (status) filter.status = status;
//     if (country) filter.country = country;
//     if (state) filter.state = state;

//     const colleges = await College.find(filter)
//       .populate('country state courses')
//       .limit(Number(limit))
//       .skip((page - 1) * limit)
//       .sort({ createdAt: -1 });

//     const total = await College.countDocuments(filter);

//     res.json({
//       colleges,
//       totalPages: Math.ceil(total / limit),
//       currentPage: Number(page),
//       total
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // READ SINGLE
// exports.getCollegeById = async (req, res) => {
//   try {
//     const college = await College.findById(req.params.id)
//       .populate('country state courses');

//     if (!college) return res.status(404).json({ error: 'College not found' });
//     res.json(college);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // UPDATE
// exports.updateCollege = async (req, res) => {
//   try {
//     const {
//       name, email, phone, address, website, desc, map,
//       category, status, facilities, services, country, state, courses, visible
//     } = req.body;

//     const college = await College.findById(req.params.id);
//     if (!college) return res.status(404).json({ error: 'College not found' });

//     // 🔍 check duplicate name (ignore current college)
//     if (name && name.toLowerCase() !== college.name.toLowerCase()) {
//       const existingCollege = await College.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
//       if (existingCollege) {
//         return res.status(400).json({ error: 'College name already exists' });
//       }
//     }

//     if (req.file && college.image) {
//       const oldImagePath = path.join(__dirname, `../../public/college/${path.basename(college.image)}`);
//       if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
//     }

//     const image = req.file
//       ? `${req.protocol}://${req.get('host')}/public/college/${req.file.filename}`
//       : college.image;

//     const updateData = {
//       name, email, phone, address, website, desc, map,
//       category: safeParseJSON(category),
//       status, country, state,
//       image,
//       visible: visible !== undefined ? JSON.parse(visible) : college.visible,
//       facilities: safeParseJSON(facilities),
//       services: safeParseJSON(services),
//       courses: safeParseJSON(courses)
//     };

//     const updated = await College.findByIdAndUpdate(req.params.id, updateData, { new: true })
//       .populate('country state courses');

//     res.json(updated);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // DELETE
// exports.deleteCollege = async (req, res) => {
//   try {
//     const college = await College.findById(req.params.id);
//     if (!college) return res.status(404).json({ error: 'College not found' });

//     if (college.image) {
//       const imagePath = path.join(__dirname, `../../public/college/${path.basename(college.image)}`);
//       if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
//     }

//     await College.findByIdAndDelete(req.params.id);
//     res.json({ message: 'College permanently deleted' });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // COUNT
// exports.getCollegeCount = async (req, res) => {
//   try {
//     const count = await College.countDocuments();
//     res.json({ count });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };





const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const College = require('../models/college');

// Utility: Safe JSON parsing with fallback
const safeParseJSON = (value, fieldName, fallback = []) => {
  if (!value) return fallback;
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    console.warn(`Failed to parse ${fieldName}:`, value);
    return fallback;
  }
};

// ========================== CREATE ==========================
exports.createCollege = async (req, res) => {
  try {
    const {
      name, email, phone, address, website, desc, map,
      category, status, facilities, services, country, state, courses, visible, isDomestic
    } = req.body;

    console.log('Create college payload:', req.body);

    // Duplicate name check
    const existingCollege = await College.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
    if (existingCollege) return res.status(400).json({ error: 'College name already exists' });

    const validCategories = ['Graduate', 'Postgraduate', 'Diploma', 'PhD'];

    // Parse & validate fields
    const parsedCategory = safeParseJSON(category, 'category');
    if (parsedCategory.some(cat => !validCategories.includes(cat))) {
      return res.status(400).json({ error: 'Invalid category values' });
    }

    const parsedCourses = safeParseJSON(courses, 'courses');
    if (parsedCourses.some(id => !mongoose.isValidObjectId(id))) {
      return res.status(400).json({ error: 'Invalid course IDs' });
    }

    const parsedFacilities = safeParseJSON(facilities, 'facilities');
    const parsedServices = safeParseJSON(services, 'services');

    // Handle image
    const image = req.file
      ? `${req.protocol}://${req.get('host')}/public/college/${req.file.filename}`
      : null;

    const newCollege = new College({
      name,
      email,
      phone,
      address,
      website,
      desc,
      map,
      category: parsedCategory,
      status,
      country,
      state,
      facilities: parsedFacilities,
      services: parsedServices,
      courses: parsedCourses,
      image,
      isDomestic: isDomestic === 'true' || isDomestic === true,
      visible: visible !== undefined ? JSON.parse(visible) : true,
    });

    const saved = await newCollege.save();
    const populated = await saved.populate('country state courses');

    console.log('Created college:', populated);
    res.status(201).json(populated);
  } catch (err) {
    console.error('Create college error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ========================== GET ALL ==========================
exports.getColleges = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category, status, country, state, isDomestic } = req.query;
    const matchFilter = {};

    if (status) matchFilter.status = status;
    if (country) matchFilter.country = new mongoose.Types.ObjectId(country);
    if (state) matchFilter.state = new mongoose.Types.ObjectId(state);
    if (isDomestic === 'true' || isDomestic === 'false') {
      matchFilter.isDomestic = isDomestic === 'true';
    }

    const parsedCategory = safeParseJSON(category, 'category');
    if (parsedCategory.length) matchFilter.category = { $in: parsedCategory };

    const searchMatch = search
      ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { desc: { $regex: search, $options: 'i' } },
            { facilities: { $regex: search, $options: 'i' } },
            { services: { $regex: search, $options: 'i' } },
            { category: { $regex: search, $options: 'i' } },
            { 'coursesData.title': { $regex: search, $options: 'i' } },
          ],
        }
      : null;

    const pipeline = [
      { $match: matchFilter },
      {
        $lookup: {
          from: 'courses',
          localField: 'courses',
          foreignField: '_id',
          as: 'coursesData',
        },
      },
    ];

    if (searchMatch) pipeline.push({ $match: searchMatch });

    // Populate country & state
    pipeline.push(
      {
        $lookup: {
          from: 'countries',
          localField: 'country',
          foreignField: '_id',
          as: 'country',
        },
      },
      { $unwind: { path: '$country', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'states',
          localField: 'state',
          foreignField: '_id',
          as: 'state',
        },
      },
      { $unwind: { path: '$state', preserveNullAndEmptyArrays: true } },
      { $sort: { createdAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: Number(limit) }
    );

    let colleges = await College.aggregate(pipeline);
    colleges = colleges.map((c) => ({ ...c, courses: c.coursesData || [] }));

    // Count total
    const countPipeline = [
      { $match: matchFilter },
      {
        $lookup: {
          from: 'courses',
          localField: 'courses',
          foreignField: '_id',
          as: 'coursesData',
        },
      },
    ];
    if (searchMatch) countPipeline.push({ $match: searchMatch });
    countPipeline.push({ $count: 'total' });

    const countResult = await College.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;

    res.json({
      colleges,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total,
    });
  } catch (err) {
    console.error('Get colleges error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ========================== GET BY ID ==========================
exports.getCollegeById = async (req, res) => {
  try {
    const college = await College.findById(req.params.id).populate('country state courses');
    if (!college) return res.status(404).json({ error: 'College not found' });
    res.json(college);
  } catch (err) {
    console.error('Get college by ID error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ========================== UPDATE ==========================
exports.updateCollege = async (req, res) => {
  try {
    const { name, email, phone, address, website, desc, map,
      category, status, facilities, services, country, state, courses, visible, isDomestic
    } = req.body;

    const college = await College.findById(req.params.id);
    if (!college) return res.status(404).json({ error: 'College not found' });

    // Duplicate name check
    if (name && name.toLowerCase() !== college.name.toLowerCase()) {
      const existingCollege = await College.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
      if (existingCollege) return res.status(400).json({ error: 'College name already exists' });
    }

    // Parse
    const parsedCategory = safeParseJSON(category, 'category');
    const parsedCourses = safeParseJSON(courses, 'courses');
    const parsedFacilities = safeParseJSON(facilities, 'facilities');
    const parsedServices = safeParseJSON(services, 'services');

    // Handle image
    let image = college.image;
    if (req.file) {
      if (college.image) {
        const oldPath = path.join(__dirname, '../../public/college', path.basename(college.image));
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      image = `${req.protocol}://${req.get('host')}/public/college/${req.file.filename}`;
    }

    const updateData = {
      name: name || college.name,
      email: email || college.email,
      phone: phone || college.phone,
      address: address || college.address,
      website: website || college.website,
      desc: desc || college.desc,
      map: map || college.map,
      category: parsedCategory.length ? parsedCategory : college.category,
      status: status || college.status,
      country: country || college.country,
      state: state || college.state,
      courses: parsedCourses.length ? parsedCourses : college.courses,
      facilities: parsedFacilities,
      services: parsedServices,
      image,
      visible: visible !== undefined ? JSON.parse(visible) : college.visible,
      isDomestic: isDomestic !== undefined ? (isDomestic === 'true' || isDomestic === true) : college.isDomestic,
    };

    const updated = await College.findByIdAndUpdate(req.params.id, updateData, { new: true })
      .populate('country state courses');

    res.json(updated);
  } catch (err) {
    console.error('Update college error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ========================== DELETE ==========================
exports.deleteCollege = async (req, res) => {
  try {
    const college = await College.findById(req.params.id);
    if (!college) return res.status(404).json({ error: 'College not found' });

    if (college.image) {
      const imagePath = path.join(__dirname, '../../public/college', path.basename(college.image));
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    await College.findByIdAndDelete(req.params.id);
    res.json({ message: 'College permanently deleted' });
  } catch (err) {
    console.error('Delete college error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ========================== COUNT ==========================
exports.getCollegeCount = async (req, res) => {
  try {
    const count = await College.countDocuments();
    res.json({ count });
  } catch (err) {
    console.error('Get college count error:', err);
    res.status(500).json({ error: err.message });
  }
};
