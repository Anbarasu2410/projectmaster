// routes/companies.js
const express = require('express');
const router = express.Router();
const Company = require('../models/Company');

// GET /api/companies - Get all companies
router.get('/', async (req, res) => {
  try {
    const companies = await Company.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: companies,
      count: companies.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching companies',
      error: error.message
    });
  }
});

// POST /api/companies - Create new company
router.post('/', async (req, res) => {
  try {
    const { name, tenantCode, address, contactEmail, contactPhone } = req.body;

    console.log('Received company data:', req.body);

    // Validate required fields
    if (!name || !tenantCode) {
      return res.status(400).json({
        success: false,
        message: 'Company name and tenant code are required'
      });
    }

    // Check if tenant code already exists
    const existingCompany = await Company.findOne({ tenantCode });
    if (existingCompany) {
      return res.status(400).json({
        success: false,
        message: 'Tenant code already exists'
      });
    }

    // Generate numeric ID
    const lastCompany = await Company.findOne().sort({ id: -1 });
    const newId = lastCompany ? lastCompany.id + 1 : 1;

    const company = new Company({
      id: newId,
      name: name.trim(),
      tenantCode: tenantCode.trim().toUpperCase(),
      address: address?.trim(),
      contactEmail: contactEmail?.trim().toLowerCase(),
      contactPhone: contactPhone?.trim()
    });

    const savedCompany = await company.save();
    console.log('Company saved successfully:', savedCompany);
    
    res.status(201).json({
      success: true,
      message: 'Company created successfully',
      data: savedCompany
    });
  } catch (error) {
    console.error('Error creating company:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating company',
      error: error.message
    });
  }
});

// PUT /api/companies/:id - Update company
router.put('/:id', async (req, res) => {
  try {
    const { name, tenantCode, address, contactEmail, contactPhone } = req.body;

    const updatedCompany = await Company.findByIdAndUpdate(
      req.params.id,
      {
        name,
        tenantCode,
        address,
        contactEmail,
        contactPhone,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );

    if (!updatedCompany) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    res.json({
      success: true,
      message: 'Company updated successfully',
      data: updatedCompany
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating company',
      error: error.message
    });
  }
});

// DELETE /api/companies/:id - Delete company
router.delete('/:id', async (req, res) => {
  try {
    const deletedCompany = await Company.findByIdAndDelete(req.params.id);
    
    if (!deletedCompany) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    res.json({
      success: true,
      message: 'Company deleted successfully',
      data: deletedCompany
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting company',
      error: error.message
    });
  }
});

module.exports = router;