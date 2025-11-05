const Employee = require('../models/Employee');
const Company = require('../models/Company');
const User = require('../models/User');

// @desc    Get all employees (Real-time from MongoDB)
// @route   GET /api/employees
// @access  Public
const getEmployees = async (req, res) => {
  try {
    console.log('🔄 Real-time fetching all employees from MongoDB...');
    
    // Real-time fetch from MongoDB
    const employees = await Employee.find().sort({ createdAt: -1 });
    
    console.log(`✅ Real-time fetch successful: ${employees.length} employees found`);
    
    res.json({
      success: true,
      count: employees.length,
      data: employees,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Real-time fetch failed:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching employees from database: ' + error.message,
      timestamp: new Date().toISOString()
    });
  }
};

// @desc    Get employees by company (Real-time from MongoDB)
// @route   GET /api/employees/company/:companyId
// @access  Public
const getEmployeesByCompany = async (req, res) => {
  try {
    const companyId = parseInt(req.params.companyId);
    
    if (isNaN(companyId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid company ID. Must be a number.'
      });
    }

    console.log(`🔄 Real-time fetching employees for company ID: ${companyId}`);
    
    // Real-time fetch from MongoDB filtered by companyId
    const employees = await Employee.find({ companyId: companyId }).sort({ createdAt: -1 });
    
    console.log(`✅ Real-time fetch successful: ${employees.length} employees found for company ${companyId}`);
    
    res.json({
      success: true,
      count: employees.length,
      companyId: companyId,
      data: employees,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Real-time fetch by company failed:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching employees by company: ' + error.message,
      timestamp: new Date().toISOString()
    });
  }
};

// @desc    Get active employees by company (for driver assignment)
// @route   GET /api/employees/company/:companyId/active
// @access  Public
const getActiveEmployeesByCompany = async (req, res) => {
  try {
    const companyId = parseInt(req.params.companyId);
    
    if (isNaN(companyId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid company ID. Must be a number.'
      });
    }

    console.log(`🔄 Real-time fetching ACTIVE employees for company ID: ${companyId}`);
    
    // Real-time fetch only ACTIVE employees for driver assignment
    const activeEmployees = await Employee.find({ 
      companyId: companyId,
      status: 'ACTIVE'
    }).sort({ fullName: 1 });
    
    console.log(`✅ Real-time fetch successful: ${activeEmployees.length} ACTIVE employees found for company ${companyId}`);
    
    res.json({
      success: true,
      count: activeEmployees.length,
      companyId: companyId,
      data: activeEmployees,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Real-time fetch active employees failed:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching active employees: ' + error.message,
      timestamp: new Date().toISOString()
    });
  }
};

// @desc    Create a new employee
// @route   POST /api/employees
// @access  Public
const createEmployee = async (req, res) => {
  try {
    const { id, companyId, userId, employeeCode, fullName, phone, jobTitle, status, createdAt } = req.body;

    // Validate required fields
    if (!id || !companyId || !fullName) {
      return res.status(400).json({
        success: false,
        message: 'ID, companyId, and fullName are required fields'
      });
    }

    // Validate ID is a number
    if (isNaN(id) || isNaN(companyId) || (userId && isNaN(userId))) {
      return res.status(400).json({
        success: false,
        message: 'ID, companyId, and userId must be numbers'
      });
    }

    // Validate fullName is not empty
    if (fullName.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Full name cannot be empty'
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

    // Check if user exists (if provided)
    if (userId) {
      const userExists = await User.findOne({ id: userId });
      if (!userExists) {
        return res.status(400).json({
          success: false,
          message: `User with ID ${userId} does not exist`
        });
      }
    }

    // Check if employee already exists by ID
    const existingEmployeeById = await Employee.findOne({ id: id });
    if (existingEmployeeById) {
      return res.status(400).json({
        success: false,
        message: `Employee with ID ${id} already exists`
      });
    }

    // Check if employee code is unique (if provided)
    if (employeeCode) {
      const existingEmployeeByCode = await Employee.findOne({ 
        employeeCode: employeeCode.trim()
      });
      if (existingEmployeeByCode) {
        return res.status(400).json({
          success: false,
          message: `Employee with code '${employeeCode}' already exists`
        });
      }
    }

    // Create employee with createdAt timestamp
    const employee = new Employee({
      id: parseInt(id),
      companyId: parseInt(companyId),
      userId: userId ? parseInt(userId) : null,
      employeeCode: employeeCode ? employeeCode.trim() : null,
      fullName: fullName.trim(),
      phone: phone ? phone.trim() : null,
      jobTitle: jobTitle ? jobTitle.trim() : null,
      status: status || 'ACTIVE',
      createdAt: createdAt ? new Date(createdAt) : new Date()
    });

    const savedEmployee = await employee.save();

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: savedEmployee,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error creating employee:', error);
    
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors,
        timestamp: new Date().toISOString()
      });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `Employee with this ${field} already exists`,
        timestamp: new Date().toISOString()
      });
    }

    // Handle invalid date format
    if (error.name === 'TypeError' && error.message.includes('Invalid time value')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format for createdAt. Use ISO format (e.g., 2024-01-15T10:30:00.000Z)',
        timestamp: new Date().toISOString()
      });
    }

    // Generic server error
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message,
      timestamp: new Date().toISOString()
    });
  }
};

// @desc    Get employee by ID
// @route   GET /api/employees/:id
// @access  Public
const getEmployeeById = async (req, res) => {
  try {
    const employeeId = parseInt(req.params.id);
    
    if (isNaN(employeeId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid employee ID. Must be a number.',
        timestamp: new Date().toISOString()
      });
    }

    console.log(`🔍 Fetching employee with ID: ${employeeId}`);
    
    const employee = await Employee.findOne({ id: employeeId });
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: `Employee with ID ${employeeId} not found`,
        timestamp: new Date().toISOString()
      });
    }

    console.log(`✅ Employee found: ${employee.fullName}`);
    
    res.json({
      success: true,
      data: employee,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error fetching employee by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching employee: ' + error.message,
      timestamp: new Date().toISOString()
    });
  }
};

// @desc    Get employees by status
// @route   GET /api/employees/status/:status
// @access  Public
const getEmployeesByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const validStatuses = ['ACTIVE', 'INACTIVE', 'SUSPENDED'];
    
    if (!validStatuses.includes(status.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}`,
        timestamp: new Date().toISOString()
      });
    }

    console.log(`🔍 Fetching employees with status: ${status}`);
    
    const employees = await Employee.find({ status: status.toUpperCase() }).sort({ createdAt: -1 });
    
    console.log(`✅ Found ${employees.length} employees with status ${status}`);
    
    res.json({
      success: true,
      count: employees.length,
      status: status.toUpperCase(),
      data: employees,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error fetching employees by status:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching employees by status: ' + error.message,
      timestamp: new Date().toISOString()
    });
  }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Public
const updateEmployee = async (req, res) => {
  try {
    const employeeId = parseInt(req.params.id);
    
    if (isNaN(employeeId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid employee ID. Must be a number.',
        timestamp: new Date().toISOString()
      });
    }

    console.log(`✏️ Updating employee with ID: ${employeeId}`);

    // Check if employee exists
    const existingEmployee = await Employee.findOne({ id: employeeId });
    if (!existingEmployee) {
      return res.status(404).json({
        success: false,
        message: `Employee with ID ${employeeId} not found`,
        timestamp: new Date().toISOString()
      });
    }

    // Prepare update data
    const updateData = { ...req.body };

    // If updating companyId, check if company exists
    if (updateData.companyId) {
      if (isNaN(updateData.companyId)) {
        return res.status(400).json({
          success: false,
          message: 'Company ID must be a number',
          timestamp: new Date().toISOString()
        });
      }

      const companyExists = await Company.findOne({ id: updateData.companyId });
      if (!companyExists) {
        return res.status(400).json({
          success: false,
          message: `Company with ID ${updateData.companyId} does not exist`,
          timestamp: new Date().toISOString()
        });
      }
      updateData.companyId = parseInt(updateData.companyId);
    }

    // If updating userId, check if user exists
    if (updateData.userId) {
      if (isNaN(updateData.userId)) {
        return res.status(400).json({
          success: false,
          message: 'User ID must be a number',
          timestamp: new Date().toISOString()
        });
      }

      const userExists = await User.findOne({ id: updateData.userId });
      if (!userExists) {
        return res.status(400).json({
          success: false,
          message: `User with ID ${updateData.userId} does not exist`,
          timestamp: new Date().toISOString()
        });
      }
      updateData.userId = parseInt(updateData.userId);
    }

    // If updating employeeCode, check if it's unique
    if (updateData.employeeCode) {
      const employeeCodeExists = await Employee.findOne({
        employeeCode: updateData.employeeCode.trim(),
        id: { $ne: employeeId } // Exclude current employee
      });
      
      if (employeeCodeExists) {
        return res.status(400).json({
          success: false,
          message: `Employee code '${updateData.employeeCode}' is already taken by another employee`,
          timestamp: new Date().toISOString()
        });
      }
      updateData.employeeCode = updateData.employeeCode.trim();
    }

    // If updating fullName, trim it
    if (updateData.fullName) {
      if (updateData.fullName.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Full name cannot be empty',
          timestamp: new Date().toISOString()
        });
      }
      updateData.fullName = updateData.fullName.trim();
    }

    // If updating status, validate it
    if (updateData.status) {
      const validStatuses = ['ACTIVE', 'INACTIVE', 'SUSPENDED'];
      if (!validStatuses.includes(updateData.status.toUpperCase())) {
        return res.status(400).json({
          success: false,
          message: `Status must be one of: ${validStatuses.join(', ')}`,
          timestamp: new Date().toISOString()
        });
      }
      updateData.status = updateData.status.toUpperCase();
    }

    // Update the employee
    const employee = await Employee.findOneAndUpdate(
      { id: employeeId },
      updateData,
      { 
        new: true, 
        runValidators: true,
        context: 'query'
      }
    );

    console.log(`✅ Employee updated successfully: ${employee.fullName}`);

    res.json({
      success: true,
      message: 'Employee updated successfully',
      data: employee,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error updating employee:', error);
    
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors,
        timestamp: new Date().toISOString()
      });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `Employee with this ${field} already exists`,
        timestamp: new Date().toISOString()
      });
    }

    res.status(400).json({
      success: false,
      message: 'Error updating employee: ' + error.message,
      timestamp: new Date().toISOString()
    });
  }
};

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Public
const deleteEmployee = async (req, res) => {
  try {
    const employeeId = parseInt(req.params.id);
    
    if (isNaN(employeeId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid employee ID. Must be a number.',
        timestamp: new Date().toISOString()
      });
    }

    console.log(`🗑️ Deleting employee with ID: ${employeeId}`);

    const employee = await Employee.findOneAndDelete({ id: employeeId });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: `Employee with ID ${employeeId} not found`,
        timestamp: new Date().toISOString()
      });
    }

    console.log(`✅ Employee deleted: ${employee.fullName}`);

    res.json({
      success: true,
      message: 'Employee deleted successfully',
      deletedEmployee: {
        id: employee.id,
        fullName: employee.fullName,
        employeeCode: employee.employeeCode,
        companyId: employee.companyId,
        status: employee.status,
        createdAt: employee.createdAt
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error deleting employee:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting employee: ' + error.message,
      timestamp: new Date().toISOString()
    });
  }
};

// @desc    Update employee status
// @route   PATCH /api/employees/:id/status
// @access  Public
const updateEmployeeStatus = async (req, res) => {
  try {
    const employeeId = parseInt(req.params.id);
    const { status } = req.body;
    
    if (isNaN(employeeId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid employee ID. Must be a number.',
        timestamp: new Date().toISOString()
      });
    }

    const validStatuses = ['ACTIVE', 'INACTIVE', 'SUSPENDED'];
    if (!status || !validStatuses.includes(status.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}`,
        timestamp: new Date().toISOString()
      });
    }

    console.log(`🔄 Updating employee ${employeeId} status to: ${status}`);

    const employee = await Employee.findOneAndUpdate(
      { id: employeeId },
      { status: status.toUpperCase() },
      { new: true }
    );

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: `Employee with ID ${employeeId} not found`,
        timestamp: new Date().toISOString()
      });
    }

    console.log(`✅ Employee status updated: ${employee.fullName} -> ${employee.status}`);

    res.json({
      success: true,
      message: `Employee status updated to ${employee.status}`,
      data: employee,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error updating employee status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating employee status: ' + error.message,
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = {
  createEmployee,
  getEmployees,
  getEmployeeById,
  getEmployeesByCompany,
  getActiveEmployeesByCompany,
  getEmployeesByStatus,
  updateEmployee,
  deleteEmployee,
  updateEmployeeStatus
};