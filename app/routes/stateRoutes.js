const express = require('express');
const router = express.Router();
const {
  createState,
  getAllStates,
  getStateById,
  updateState,
  deleteState,
  getStateCount 
} = require('../Controllers/stateController');


router.post('/', createState);
router.get('/', getAllStates);
router.get('/count', getStateCount);
router.get('/:id', getStateById);
router.put('/:id', updateState);
router.delete('/:id', deleteState);

module.exports = router;
