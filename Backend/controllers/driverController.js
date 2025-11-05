const Driver = require('../models/Driver');
const Company = require('../models/Company');
const { v4: uuidv4 } = require('uuid');
const Employee = require('../models/Employee');

// Create new driver - FIXED VERSION
const createDriver = async (req, res) => {
  try {
    console.log('🚗 Creating new driver with data:', req.body);

    const {
      companyId,
      employeeId,
      employeeName,
      employeeCode,
      jobTitle,
      licenseNo,
      licenseExpiry,
      vehicleId,
      status = 'ACTIVE'
    } = req.body;

    // Validate required fields
    if (!companyId || !employeeId || !licenseNo) {
      return res.status(400).json({
        success: false,
        message: 'Company ID, Employee ID, and License Number are required fields'
      });
    }

    // Check if employee exists
    const employee = await Employee.findOne({ id: employeeId });
    if (!employee) {
      return res.status(400).json({
        success: false,
        message: `Employee with ID ${employeeId} not found`
      });
    }

    // FIXED: Check if ACTIVE driver already exists for this employee
    const existingActiveDriver = await Driver.findOne({ 
      employeeId: employeeId,
      status: 'ACTIVE'  // Only check for active drivers
    });
    if (existingActiveDriver && status === 'ACTIVE') {
      return res.status(400).json({
        success: false,
        message: `Active driver already exists for employee ${employeeId}`
      });
    }

    // Generate a new ID if not provided
    const latestDriver = await Driver.findOne().sort({ id: -1 });
    const newId = latestDriver ? latestDriver.id + 1 : 1;

    const driverData = {
      id: newId, // Auto-generate ID
      companyId: parseInt(companyId),
      employeeId: parseInt(employeeId),
      employeeName: employeeName || employee.fullName,
      employeeCode: employeeCode || employee.employeeCode,
      jobTitle: jobTitle || employee.jobTitle,
      licenseNo: licenseNo,
      licenseExpiry: licenseExpiry,
      vehicleId: vehicleId,
      status: status,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('✅ Creating driver with data:', driverData);

    const driver = new Driver(driverData);
    await driver.save();

    res.status(201).json({
      success: true,
      message: 'Driver created successfully',
      data: driver
    });
  } catch (error) {
    console.error('❌ Error creating driver:', error);
    res.status(400).json({
      success: false,
      message: 'Error creating driver: ' + error.message
    });
  }
};

// Keep all your other functions the same...
const getAllDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: drivers,
      count: drivers.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching drivers',
      error: error.message
    });
  }
};

const getDriverById = async (req, res) => {
  try {
    const driver = await Driver.findOne({ id: req.params.id });
    
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    res.json({
      success: true,
      data: driver
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching driver',
      error: error.message
    });
  }
};

const updateDriver = async (req, res) => {
  try {
    const driver = await Driver.findOneAndUpdate(
      { id: req.params.id },
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    res.json({
      success: true,
      message: 'Driver updated successfully',
      data: driver
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating driver',
      error: error.message
    });
  }
};

const deleteDriver = async (req, res) => {
  try {
    const driver = await Driver.findOneAndDelete({ id: req.params.id });

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    res.json({
      success: true,
      message: 'Driver deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting driver',
      error: error.message
    });
  }
};

const getDriversByCompany = async (req, res) => {
  try {
    const { companyId } = req.params;

    console.log('🔍 getDriversByCompany called with companyId:', companyId, 'Type:', typeof companyId);

    let queryCompanyId;

    if (typeof companyId === 'string' && companyId.length === 24) {
      console.log('📝 Detected MongoDB _id, finding numeric ID from company');
      const company = await Company.findOne({ _id: companyId });
      if (!company) {
        return res.status(404).json({
          success: false,
          message: `Company with _id ${companyId} not found`
        });
      }
      queryCompanyId = company.id;
      console.log('✅ Found company:', company.name, 'Numeric ID:', queryCompanyId);
    } else {
      queryCompanyId = parseInt(companyId);
      if (isNaN(queryCompanyId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid company ID. Must be a number or valid MongoDB _id.'
        });
      }
    }

    console.log('🔍 Querying drivers with companyId:', queryCompanyId);

    const drivers = await Driver.find({ companyId: queryCompanyId });

    console.log('✅ Found', drivers.length, 'drivers for company', queryCompanyId);

    res.json({
      success: true,
      data: drivers,
      count: drivers.length
    });
  } catch (error) {
    console.error('❌ Error in getDriversByCompany:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching drivers by company',
      error: error.message
    });
  }
};

const getDriversByVehicle = async (req, res) => {
  try {
    const drivers = await Driver.find({ vehicleId: req.params.vehicleId });
    
    res.json({
      success: true,
      data: drivers,
      count: drivers.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching drivers by vehicle',
      error: error.message
    });
  }
};

module.exports = {
  getAllDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  deleteDriver,
  getDriversByCompany,
  getDriversByVehicle
};