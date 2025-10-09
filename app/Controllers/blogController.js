const fs = require('fs');
const path = require('path');
const Blog = require('../models/blog');

// Create a new blog
exports.createBlog = async (req, res) => {
  try {
    const { title, shortDesc, fullDesc, link } = req.body;
    const image = req.file
      ? `${req.protocol}://${req.get('host')}/public/blog/${req.file.filename}`
      : null;

    if (!image) return res.status(400).json({ error: 'Image is required.' });

    const blog = new Blog({ title, shortDesc, fullDesc, link, image });
    const saved = await blog.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all blogs
exports.getAllBlog = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    const total = await Blog.countDocuments();
    res.json({ total, data: blogs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single blog
exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    res.json(blog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update blog
// Update blog
exports.updateBlog = async (req, res) => {
  try {
    const { title, shortDesc, fullDesc, link } = req.body;

    // Find existing blog
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: 'Blog not found' });

    // Prepare update object
    const updateData = { title, shortDesc, fullDesc, link };

    // Check if a new image is uploaded
    if (req.file) {
      // Delete old image if it exists and is not the default one
      if (blog.image && !blog.image.includes('/public/default/')) {
        const oldImagePath = path.join(
          __dirname,
          `../../public/blog/${path.basename(blog.image)}`
        );

        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      // Set new image URL
      updateData.image = `${req.protocol}://${req.get('host')}/public/blog/${req.file.filename}`;
    } else {
      // Keep existing image if no new one is uploaded
      updateData.image = blog.image;
    }

    // Update the blog document
    const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, updateData, { new: true });

    res.status(200).json(updatedBlog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Hard delete blog
exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    // Delete local image
    if (blog.image) {
      const imagePath = path.join(__dirname, `../../public/blog/${path.basename(blog.image)}`);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    await Blog.findByIdAndDelete(req.params.id);
    res.json({ message: 'Blog permanently deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
