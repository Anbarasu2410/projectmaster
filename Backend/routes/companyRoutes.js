const express = require('express');
const router = express.Router();
const {
  createCompany,
  getCompanies,
  getCompanyById,
  getCompanyByTenantCode,
  updateCompany,
  deleteCompany
} = require('../controllers/companyController');

router.post('/', createCompany);
router.get('/', getCompanies);
router.get('/:id', getCompanyById);
router.get('/tenant/:tenantCode', getCompanyByTenantCode);
router.put('/:id', updateCompany);
router.delete('/:id', deleteCompany);

module.exports = router;