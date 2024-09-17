const express = require("express")
const paymentController = require('../controllers/paymentController')
const router = express.Router()
const {authMiddleware}=require('../middleware/authMiddleware')
const {authRole}=require('../middleware/authRole')
router.use(authMiddleware)

router.route("/")
.get(paymentController.getAllPayment)
.post(authRole('admin'),paymentController.createPayment)

router.route("/:id")
.get(paymentController.getPayment)

router.patch('/:id/active',authRole('admin'),paymentController.activePayment)
router.patch('/:id/deactivate',authRole('admin'),paymentController.deletePayment)


module.exports = router