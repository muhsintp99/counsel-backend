// const Blog = require('../models/blog');

// // Create a new blog
// exports.createBlog = async (req, res) => {
//   try {
//     const { title, shortDesc, fullDesc, link, createdBy, updatedBy } = req.body;
//     // const image = req.file ? `/public/blog/${req.file.filename}` : null;
//     const image = req.file ? req.file.path : null;

//     if (!image) return res.status(400).json({ error: 'Image is required.' });

//     const blog = new Blog({ title, shortDesc, fullDesc, link, image, createdBy, updatedBy });
//     const saved = await blog.save();
//     res.status(201).json(saved);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // Get all blogs
// exports.getAllBlog = async (req, res) => {
//   try {
//     const blogs = await Blog.find({ isDeleted: false }).sort({ createdAt: -1 });;
//     const total = await Blog.countDocuments({ isDeleted: false });
//     res.json({
//       total,
//       data: blogs
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // Get a single blog
// exports.getBlogById = async (req, res) => {
//   try {
//     const blog = await Blog.findOne({ _id: req.params.id, isDeleted: false });
//     if (!blog) return res.status(404).json({ message: 'Blog not found' });
//     res.json(blog);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // Update blog
// exports.updateBlog = async (req, res) => {
//   try {
//     const { title, shortDesc, fullDesc, link, updatedBy } = req.body;
//     const image = req.file ? req.file.path : null;

//     // Check if blog exists
//     const blog = await Blog.findById(req.params.id);
//     if (!blog || blog.isDeleted) {
//       return res.status(404).json({ error: 'Blog not found or has been deleted' });
//     }

//     const updateData = { title, shortDesc, fullDesc, link, updatedBy };
//     if (image) updateData.image = image;

//     const updated = await Blog.findByIdAndUpdate(req.params.id, updateData, { new: true });
//     if (!updated) {
//       return res.status(500).json({ error: 'Failed to update blog' });
//     }

//     res.json(updated);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // Soft delete
// exports.softDeleteBlog = async (req, res) => {
//   try {
//     const deleted = await Blog.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
//     res.json({ message: 'Blog deleted', data: deleted });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // Hard delete
// exports.deleteBlog = async (req, res) => {
//   try {
//     const deleted = await Blog.findByIdAndDelete(req.params.id);
//     if (!deleted) return res.status(404).json({ message: 'Blog not found' });
//     res.json({ message: 'Blog permanently deleted' });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };


// ------------------------------------------------------------------------------------------------------------------


const Blog = require('../models/blog');
const path = require('path');
const fs = require('fs').promises; // Use promises for async file operations

// Format full image URL
const getImageUrl = (req, imagePath) => {
  if (!imagePath) return null;
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}${imagePath}`;
};

// Create Blog
exports.createBlog = async (req, res) => {
  try {
    const { title, shortDesc, fullDesc, link } = req.body;

    // Validate required fields
    if (!title || !shortDesc || !fullDesc ) {
      return res.status(400).json({ error: 'Missing required fields: title, shortDesc, fullDesc' });
    }

    // Validate ObjectId format

    const image = req.file ? `/public/blog/${req.file.filename}` : '/public/default/picture.png';

    const blog = new Blog({ title, shortDesc, fullDesc, link, image });
    const saved = await blog.save();

    res.status(201).json({
      message: 'Blog created successfully',
      data: { ...saved.toObject(), image: getImageUrl(req, saved.image) },
    });
  } catch (err) {
    console.error('Create Blog Error:', {
      message: err.message,
      stack: err.stack,
      body: req.body,
      file: req.file,
    });
    if (err.name === 'MongoServerError' && err.code === 11000) {
      return res.status(400).json({ error: 'Duplicate link provided' });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: Object.values(err.errors).map(e => e.message).join(', ') });
    }
    res.status(500).json({ error: 'Failed to create blog' });
  }
};

// Get all blogs
exports.getAllBlog = async (req, res) => {
  try {
    const blogs = await Blog.find({ isDeleted: false }).sort({ createdAt: -1 });

    const result = blogs.map((blog) => ({
      ...blog.toObject(),
      image: getImageUrl(req, blog.image),
    }));

    res.json({ total: result.length, data: result });
  } catch (err) {
    console.error('Get All Blogs Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch blogs' });
  }
};

// Get blog by ID
exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findOne({ _id: req.params.id, isDeleted: false });
    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    res.json({
      ...blog.toObject(),
      image: getImageUrl(req, blog.image),
    });
  } catch (err) {
    console.error('Get Blog By ID Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch blog' });
  }
};

// Update Blog
exports.updateBlog = async (req, res) => {
  try {
    const { title, shortDesc, fullDesc, link } = req.body;

    // Validate required fields
    if (!title || !shortDesc || !fullDesc) {
      return res.status(400).json({ error: 'Missing required fields: title, shortDesc, fullDesc' });
    }

    const blog = await Blog.findById(req.params.id);
    if (!blog || blog.isDeleted) {
      return res.status(404).json({ error: 'Blog not found or has been deleted' });
    }

    // Delete old image if a new one is uploaded and it's not the default
    if (req.file && blog.image && blog.image !== '/public/default/picture.png') {
      try {
        const oldImagePath = path.join(__dirname, '../../', blog.image);
        if (await fs.access(oldImagePath).then(() => true).catch(() => false)) {
          await fs.unlink(oldImagePath);
        }
      } catch (err) {
        console.error('Failed to delete old image:', err.message);
      }
    }

    const updateData = { title, shortDesc, fullDesc, link };
    if (req.file) {
      updateData.image = `/public/blog/${req.file.filename}`;
    }

    const updated = await Blog.findByIdAndUpdate(req.params.id, updateData, { new: true });

    res.json({
      message: 'Blog updated successfully',
      data: {
        ...updated.toObject(),
        image: getImageUrl(req, updated.image),
      },
    });
  } catch (err) {
    console.error('Update Blog Error:', {
      message: err.message,
      stack: err.stack,
      body: req.body,
      file: req.file,
    });
    if (err.name === 'MongoServerError' && err.code === 11000) {
      return res.status(400).json({ error: 'Duplicate link provided' });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: Object.values(err.errors).map(e => e.message).join(', ') });
    }
    res.status(500).json({ error: 'Failed to update blog' });
  }
};

// Soft delete
exports.softDeleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog || blog.isDeleted) {
      return res.status(404).json({ error: 'Blog not found or already deleted' });
    }

    const deleted = await Blog.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
    res.json({ message: 'Blog soft deleted', data: deleted });
  } catch (err) {
    console.error('Soft Delete Blog Error:', err.message);
    res.status(500).json({ error: 'Failed to soft delete blog' });
  }
};

// Hard delete
exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    // Delete associated image if not default
    if (blog.image && blog.image !== '/public/default/picture.png') {
      try {
        const imagePath = path.join(__dirname, '../../', blog.image);
        if (await fs.access(imagePath).then(() => true).catch(() => false)) {
          await fs.unlink(imagePath);
        }
      } catch (err) {
        console.error('Failed to delete image:', err.message);
      }
    }

    await Blog.findByIdAndDelete(req.params.id);
    res.json({ message: 'Blog permanently deleted' });
  } catch (err) {
    console.error('Hard Delete Blog Error:', err.message);
    res.status(500).json({ error: 'Failed to delete blog' });
  }
};