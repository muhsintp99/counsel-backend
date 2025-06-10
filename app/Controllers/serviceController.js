const Service = require('../models/service');

// Create a new service
exports.createService = async (req, res) => {
  try {
    const { title, shortDesc, fullDesc, createdBy, updatedBy } = req.body;
    const image = req.file ? `/public/service/${req.file.filename}` : null;

    if (!image) return res.status(400).json({ error: 'Image is required.' });

    const service = new Service({ title, shortDesc, fullDesc, image, createdBy, updatedBy });
    const saved = await service.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all services
exports.getAllServices = async (req, res) => {
  try {
    const services = await Service.find({ isDeleted: false });
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single service
exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findOne({ _id: req.params.id, isDeleted: false });
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json(service);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update service
exports.updateService = async (req, res) => {
  try {
    const { title, shortDesc, fullDesc, link, updatedBy } = req.body;
    const image = req.file ? `/public/service/${req.file.filename}` : undefined;

    const updateData = { title, shortDesc, fullDesc, link, updatedBy };
    if (image) updateData.image = image;

    const updated = await Service.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Soft delete service
exports.softDeleteService = async (req, res) => {
  try {
    const id = req.params.id;
    const service = await Service.findByIdAndUpdate(
      id,
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json({ message: 'Service soft deleted successfully', service });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// hard delete service
exports.hardDeleteService = async (req, res) => {
  try {
    const id = req.params.id;
    const deletedService = await Service.findByIdAndDelete(id);
    if (!deletedService) return res.status(404).json({ message: 'Service not found' });
    res.json({ message: 'Service permanently deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get total count of services
exports.totalServiceCount = async (req, res) => {
  try {
    const count = await Service.countDocuments({ isDeleted: false });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
