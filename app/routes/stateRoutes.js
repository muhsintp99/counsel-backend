const express = require('express');
const router = express.Router();
const stateController = require('../controllers/stateController');

router.post('/', stateController.createState);
router.get('/', stateController.getAllStates);
router.get('/count', stateController.getStateCount);
router.get('/:id', stateController.getStateById);
router.put('/:id', stateController.updateState);
router.delete('/:id', stateController.deleteState);

module.exports = router;
