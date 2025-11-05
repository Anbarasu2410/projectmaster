const Company = require('../models/Company');

// @desc    Create a new company
// @route   POST /api/companies
// @access  Public
const createCompany = async (req, res) => {
  try {
    const { id, name, tenantCode, createdAt } = req.body;

    // Validate required fields
    if (!id || !name || !tenantCode) {
      return res.status(400).json({
        success: false,
        message: 'ID, name, and tenantCode are required fields'
      });
    }

    // Validate ID is a number
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID must be a number'
      });
    }

    // Validate name is not empty
    if (name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Company name cannot be empty'
      });
    }

    // Validate tenantCode is not empty
    if (tenantCode.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Tenant code cannot be empty'
      });
    }

    // Check if company already exists by ID
    const existingCompanyById = await Company.findOne({ id: id });
    if (existingCompanyById) {
      return res.status(400).json({
        success: false,
        message: `Company with ID ${id} already exists`
      });
    }

    // Check if company already exists by tenantCode
    const existingCompanyByTenant = await Company.findOne({ 
      tenantCode: tenantCode.toUpperCase().trim()
    });
    if (existingCompanyByTenant) {
      return res.status(400).json({
        success: false,
        message: `Company with tenant code ${tenantCode} already exists`
      });
    }

    // Create company with createdAt timestamp
    const company = new Company({
      id: parseInt(id),
      name: name.trim(),
      tenantCode: tenantCode.toUpperCase().trim(),
      createdAt: createdAt ? new Date(createdAt) : new Date()
    });

    const savedCompany = await company.save();

    res.status(201).json({
      success: true,
      message: 'Company created successfully',
      data: savedCompany
    });
  } catch (error) {
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors
      });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `Company with this ${field} already exists`
      });
    }

    // Handle invalid date format
    if (error.name === 'TypeError' && error.message.includes('Invalid time value')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format for createdAt. Use ISO format (e.g., 2024-01-15T10:30:00.000Z)'
      });
    }

    // Generic server error
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// @desc    Get all companies
// @route   GET /api/companies
// @access  Public
const getCompanies = async (req, res) => {
  try {
    const companies = await Company.find().sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: companies.length,
      data: companies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching companies: ' + error.message
    });
  }
};

// @desc    Get company by ID
// @route   GET /api/companies/:id
// @access  Public
const getCompanyById = async (req, res) => {
  try {
    const companyId = parseInt(req.params.id);
    
    if (isNaN(companyId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid company ID. Must be a number.'
      });
    }

    const company = await Company.findOne({ id: companyId });
    
    if (!company) {
      return res.status(404).json({
        success: false,
        message: `Company with ID ${companyId} not found`
      });
    }

    res.json({
      success: true,
      data: company
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching company: ' + error.message
    });
  }
};

// @desc    Get company by tenantCode
// @route   GET /api/companies/tenant/:tenantCode
// @access  Public
const getCompanyByTenantCode = async (req, res) => {
  try {
    const { tenantCode } = req.params;

    if (!tenantCode || tenantCode.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Tenant code is required'
      });
    }

    const company = await Company.findOne({ 
      tenantCode: tenantCode.toUpperCase().trim()
    });
    
    if (!company) {
      return res.status(404).json({
        success: false,
        message: `Company with tenant code '${tenantCode}' not found`
      });
    }

    res.json({
      success: true,
      data: company
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching company: ' + error.message
    });
  }
};

// @desc    Update company
// @route   PUT /api/companies/:id
// @access  Public
const updateCompany = async (req, res) => {
  try {
    const companyId = parseInt(req.params.id);
    
    if (isNaN(companyId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid company ID. Must be a number.'
      });
    }

    // Check if company exists
    const existingCompany = await Company.findOne({ id: companyId });
    if (!existingCompany) {
      return res.status(404).json({
        success: false,
        message: `Company with ID ${companyId} not found`
      });
    }

    // Prepare update data
    const updateData = { ...req.body };

    // If updating tenantCode, check if it's already taken by another company
    if (updateData.tenantCode) {
      if (updateData.tenantCode.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Tenant code cannot be empty'
        });
      }

      updateData.tenantCode = updateData.tenantCode.toUpperCase().trim();
      
      const tenantCodeExists = await Company.findOne({
        tenantCode: updateData.tenantCode,
        id: { $ne: companyId } // Exclude current company
      });
      
      if (tenantCodeExists) {
        return res.status(400).json({
          success: false,
          message: `Tenant code '${updateData.tenantCode}' is already taken by another company`
        });
      }
    }

    // If updating name, trim it
    if (updateData.name) {
      if (updateData.name.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Company name cannot be empty'
        });
      }
      updateData.name = updateData.name.trim();
    }

    // Update the company
    const company = await Company.findOneAndUpdate(
      { id: companyId },
      updateData,
      { 
        new: true, 
        runValidators: true,
        context: 'query'
      }
    );

    res.json({
      success: true,
      message: 'Company updated successfully',
      data: company
    });
  } catch (error) {
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors
      });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `Company with this ${field} already exists`
      });
    }

    res.status(400).json({
      success: false,
      message: 'Error updating company: ' + error.message
    });
  }
};

// @desc    Delete company
// @route   DELETE /api/companies/:id
// @access  Public
const deleteCompany = async (req, res) => {
  try {
    const companyId = parseInt(req.params.id);
    
    if (isNaN(companyId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid company ID. Must be a number.'
      });
    }

    const company = await Company.findOneAndDelete({ id: companyId });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: `Company with ID ${companyId} not found`
      });
    }

    res.json({
      success: true,
      message: 'Company deleted successfully',
      deletedCompany: {
        id: company.id,
        name: company.name,
        tenantCode: company.tenantCode,
        createdAt: company.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting company: ' + error.message
    });
  }
};

module.exports = {
  createCompany,
  getCompanies,
  getCompanyById,
  getCompanyByTenantCode,
  updateCompany,
  deleteCompany
};