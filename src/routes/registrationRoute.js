const express = require("express")
const registrationController = require('../controllers/registrationController')
const router = express.Router()

router.post('/signup',registrationController.signupClient)
router.post('/resettoken',registrationController.resetToken)
router.get('/activate/:token',registrationController.activateRestaurantByVerificationToken)


module.exports = router