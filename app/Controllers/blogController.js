const Blog = require('../models/blog');

// Create a new blog
exports.createBlog = async (req, res) => {
  try {
    const { title, shortDesc, fullDesc, link, createdBy, updatedBy } = req.body;
    const image = req.file ? `/public/blog/${req.file.filename}` : null;

    if (!image) return res.status(400).json({ error: 'Image is required.' });

    const blog = new Blog({ title, shortDesc, fullDesc, link, image, createdBy, updatedBy });
    const saved = await blog.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all blogs
exports.getAllBlog = async (req, res) => {
  try {
    const blogs = await Blog.find({ isDeleted: false });
    const total = await Blog.countDocuments({ isDeleted: false });
    res.json({
      total,
      data: blogs
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single blog
exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findOne({ _id: req.params.id, isDeleted: false });
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    res.json(blog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update blog
exports.updateBlog = async (req, res) => {
  try {
    const { title, shortDesc, fullDesc, link, updatedBy } = req.body;
    const image = req.file ? `/public/blog/${req.file.filename}` : undefined;

    const updateData = { title, shortDesc, fullDesc, link, updatedBy };
    if (image) updateData.image = image;

    const updated = await Blog.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Soft delete
exports.softDeleteBlog = async (req, res) => {
  try {
    const deleted = await Blog.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
    res.json({ message: 'Blog deleted', data: deleted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
