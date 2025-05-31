const express = require('express');
const intakeCollege = require('../Controllers/intakeCollegeController')
const router = express.Router();

router.post('/', intakeCollege.createIntake);
router.get('/', intakeCollege.getAllIntakes);
router.get('/count', intakeCollege.getIntakeCount);
router.get('/:id', intakeCollege.getIntakeById);
router.put('/:id', intakeCollege.updateIntake);
router.delete('/:id', intakeCollege.deleteIntake);
router.delete('/:id', intakeCollege.hardDeleteIntake);

module.exports = router;
