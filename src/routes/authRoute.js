const express = require("express")
const authController = require('../controllers/authController')
const router = express.Router()

router.post('/login',authController.login)
router.patch('/forgotpassword',authController.forgotPassword)
router.patch('/resetpassword/:token',authController.resetPassword)
router.patch('/verification/:token',authController.validateEmailAddress)

module.exports = router