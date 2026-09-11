const express = require('express');
const router = express.Router();
const {
  bookAppointment,
  getAppointments,
  getAppointmentByRef,
} = require('../controllers/appointmentController');

router.post('/book', bookAppointment);
router.get('/', getAppointments);
router.get('/ref/:refCode', getAppointmentByRef);

module.exports = router;
