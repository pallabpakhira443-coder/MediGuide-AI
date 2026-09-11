const express = require('express');
const router = express.Router();
const {
  getHospitals,
  getHospitalById,
  compareHospitalFees,
} = require('../controllers/hospitalController');

router.get('/', getHospitals);
router.get('/compare-fees', compareHospitalFees);
router.get('/:id', getHospitalById);

module.exports = router;
