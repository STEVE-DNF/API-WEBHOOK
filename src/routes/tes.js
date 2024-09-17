const express = require("express")
const userController = require('../controllers/userController')
const router = express.Router()

router.route('/admin')
.post(userController.registerInc)


module.exports = router