const FleetAlert = require('../models/FleetAlert');
const Company = require('../models/Company');
const FleetVehicle = require('../models/FleetVehicle');
const User = require('../models/User');

// Create new fleet alert
const createFleetAlert = async (req, res) => {
  try {
    const { 
      id, 
      companyId, 
      vehicleId, 
      alertType, 
      alertMessage, 
      alertDate, 
      resolvedAt, 
      createdBy 
    } = req.body;

    // Validate required fields
    if (!id || !companyId) {
      return res.status(400).json({
        success: false,
        message: 'ID and companyId are required fields'
      });
    }

    // Validate ID is a number
    if (isNaN(id) || isNaN(companyId)) {
      return res.status(400).json({
        success: false,
        message: 'ID and companyId must be numbers'
      });
    }

    // Check if company exists
    const companyExists = await Company.findOne({ id: companyId });
    if (!companyExists) {
      return res.status(400).json({
        success: false,
        message: `Company with ID ${companyId} does not exist`
      });
    }

    // Check if vehicle exists (if provided)
    if (vehicleId) {
      const vehicleExists = await FleetVehicle.findOne({ id: vehicleId });
      if (!vehicleExists) {
        return res.status(400).json({
          success: false,
          message: `Fleet vehicle with ID ${vehicleId} does not exist`
        });
      }
    }

    // Check if createdBy user exists (if provided)
    if (createdBy) {
      const userExists = await User.findOne({ id: createdBy });
      if (!userExists) {
        return res.status(400).json({
          success: false,
          message: `User with ID ${createdBy} does not exist`
        });
      }
    }

    // Check if alert already exists by ID
    const existingAlertById = await FleetAlert.findOne({ id: id });
    if (existingAlertById) {
      return res.status(400).json({
        success: false,
        message: `Fleet alert with ID ${id} already exists`
      });
    }

    // Create fleet alert
    const fleetAlert = new FleetAlert({
      id: parseInt(id),
      companyId: parseInt(companyId),
      vehicleId: vehicleId ? parseInt(vehicleId) : null,
      alertType: alertType ? alertType.trim() : null,
      alertMessage: alertMessage ? alertMessage.trim() : null,
      alertDate: alertDate ? new Date(alertDate) : new Date(),
      resolvedAt: resolvedAt ? new Date(resolvedAt) : null,
      createdBy: createdBy ? parseInt(createdBy) : null
    });

    const savedAlert = await fleetAlert.save();

    res.status(201).json({
      success: true,
      message: 'Fleet alert created successfully',
      data: savedAlert
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: `Fleet alert with this ID already exists`
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

module.exports = {
  createFleetAlert
};