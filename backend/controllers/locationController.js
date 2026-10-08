const Location = require('../models/Location');

// @desc    Get all locations (with pagination, search)
// @route   GET /api/locations
// @access  Private
exports.getLocations = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const query = {};

    if (req.query.search) {
      query.$or = [
        { branch: { $regex: req.query.search, $options: 'i' } },
        { section: { $regex: req.query.search, $options: 'i' } },
        { shelf: { $regex: req.query.search, $options: 'i' } },
        { aisle: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const total = await Location.countDocuments(query);
    const locations = await Location.find(query)
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: locations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single location
// @route   GET /api/locations/:id
// @access  Private
exports.getLocation = async (req, res, next) => {
  try {
    const location = await Location.findById(req.params.id);
    if (!location) {
      return res.status(404).json({ success: false, message: 'Location not found' });
    }
    res.status(200).json({ success: true, data: location });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new location
// @route   POST /api/locations
// @access  Private/Admin
exports.createLocation = async (req, res, next) => {
  try {
    const { branch, section, shelf, aisle, description } = req.body;

    if (!branch || !section) {
      return res.status(400).json({ success: false, message: 'Branch and section are required' });
    }

    const location = await Location.create({
      branch,
      section,
      shelf,
      aisle,
      description
    });

    res.status(201).json({ success: true, data: location });
  } catch (error) {
    next(error);
  }
};

// @desc    Update location
// @route   PUT /api/locations/:id
// @access  Private/Admin
exports.updateLocation = async (req, res, next) => {
  try {
    let location = await Location.findById(req.params.id);
    if (!location) {
      return res.status(404).json({ success: false, message: 'Location not found' });
    }

    const { branch, section, shelf, aisle, description } = req.body;

    if (branch) location.branch = branch;
    if (section) location.section = section;
    if (shelf !== undefined) location.shelf = shelf;
    if (aisle !== undefined) location.aisle = aisle;
    if (description !== undefined) location.description = description;

    await location.save();

    res.status(200).json({ success: true, data: location });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete location
// @route   DELETE /api/locations/:id
// @access  Private/Admin
exports.deleteLocation = async (req, res, next) => {
  try {
    const location = await Location.findById(req.params.id);
    if (!location) {
      return res.status(404).json({ success: false, message: 'Location not found' });
    }

    await Location.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Location deleted successfully' });
  } catch (error) {
    next(error);
  }
};
