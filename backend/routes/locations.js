const express = require('express');
const router = express.Router();
const {
  getLocations,
  getLocation,
  createLocation,
  updateLocation,
  deleteLocation
} = require('../controllers/locationController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getLocations)
  .post(authorize('admin', 'manager'), createLocation);

router.route('/:id')
  .get(getLocation)
  .put(authorize('admin', 'manager'), updateLocation)
  .delete(authorize('admin', 'manager'), deleteLocation);

module.exports = router;
