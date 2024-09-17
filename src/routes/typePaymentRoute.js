const express = require("express")
const typePaymentController = require('../controllers/typePaymentController')
const router = express.Router()
const {authMiddleware}=require('../middleware/authMiddleware')
const {authRole}=require('../middleware/authRole')


router.use(authMiddleware)
/////////////////////////////////////////////////
router.use(authRole("good","admin"))
/////////////////////////////////////////////////
router.route("/")
.get(typePaymentController.getAllTypePayment)
.post(typePaymentController.createTypePayment)

router.route("/:id")
.get(typePaymentController.getTypePayment)
.patch(typePaymentController.updateTypePayment)

router.patch('/:id/active',typePaymentController.activeTypePayment)
router.patch('/:id/deactivate',typePaymentController.deleteTypePayment)

module.exports = router