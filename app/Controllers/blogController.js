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
const fs = require('fs');

// Format full image URL
const getImageUrl = (req, imagePath) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}${imagePath}`;
};

// Create Blog
exports.createBlog = async (req, res) => {
  try {
    const { title, shortDesc, fullDesc, link, createdBy, updatedBy } = req.body;
    const image = req.file ? `/public/blog/${req.file.filename}` : '/public/default/picture.png';

    const blog = new Blog({ title, shortDesc, fullDesc, link, image, createdBy, updatedBy });
    const saved = await blog.save();

    res.status(201).json({
      message: 'Blog created successfully',
      data: { ...saved.toObject(), image: getImageUrl(req, saved.image) }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all blogs
exports.getAllBlog = async (req, res) => {
  try {
    const blogs = await Blog.find({ isDeleted: false }).sort({ createdAt: -1 });

    const result = blogs.map(blog => ({
      ...blog.toObject(),
      image: getImageUrl(req, blog.image)
    }));

    res.json({ total: result.length, data: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get blog by ID
exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findOne({ _id: req.params.id, isDeleted: false });
    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    res.json({
      ...blog.toObject(),
      image: getImageUrl(req, blog.image)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Blog
exports.updateBlog = async (req, res) => {
  try {
    const { title, shortDesc, fullDesc, link, updatedBy } = req.body;
    const blog = await Blog.findById(req.params.id);

    if (!blog || blog.isDeleted) {
      return res.status(404).json({ error: 'Blog not found or has been deleted' });
    }

    // If new image uploaded, delete old one (if not default)
    if (req.file && blog.image && blog.image !== '/public/default/picture.png') {
      const oldImagePath = path.join(__dirname, '../../', blog.image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    const updateData = {
      title,
      shortDesc,
      fullDesc,
      link,
      updatedBy
    };

    if (req.file) {
      updateData.image = `/public/blog/${req.file.filename}`;
    }

    const updated = await Blog.findByIdAndUpdate(req.params.id, updateData, { new: true });

    res.json({
      message: 'Blog updated successfully',
      data: {
        ...updated.toObject(),
        image: getImageUrl(req, updated.image)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Soft delete
exports.softDeleteBlog = async (req, res) => {
  try {
    const deleted = await Blog.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
    res.json({ message: 'Blog soft deleted', data: deleted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Hard delete
exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    // Delete associated image if not default
    if (blog.image && blog.image !== '/public/default/picture.png') {
      const imagePath = path.join(__dirname, '../../', blog.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Blog.findByIdAndDelete(req.params.id);

    res.json({ message: 'Blog permanently deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
