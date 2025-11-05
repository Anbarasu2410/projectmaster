const express = require('express');
const router = express.Router();
const {
  createEmployee,
  getEmployees,
  getEmployeeById,
  getEmployeesByCompany,
  getActiveEmployeesByCompany,
  getEmployeesByStatus,
  updateEmployee,
  deleteEmployee,
  updateEmployeeStatus
} = require('../controllers/employeeController');

// POST /api/employees - Create new employee
router.post('/', createEmployee);

// GET /api/employees - Get all employees
router.get('/', getEmployees);

// GET /api/employees/:id - Get employee by ID
router.get('/:id', getEmployeeById);

// GET /api/employees/company/:companyId - Get employees by company
router.get('/company/:companyId', getEmployeesByCompany);

// GET /api/employees/company/:companyId/active - Get active employees by company
router.get('/company/:companyId/active', getActiveEmployeesByCompany);

// GET /api/employees/status/:status - Get employees by status
router.get('/status/:status', getEmployeesByStatus);

// PUT /api/employees/:id - Update employee
router.put('/:id', updateEmployee);

// PATCH /api/employees/:id/status - Update employee status
router.patch('/:id/status', updateEmployeeStatus);

// DELETE /api/employees/:id - Delete employee
router.delete('/:id', deleteEmployee);

module.exports = router;