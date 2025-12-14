const express = require('express')
const router = express.Router()
const salesController = require('../controllers/salesController')

router.get('/', salesController.getSales)
router.get('/options', salesController.getOptions)

module.exports = router
