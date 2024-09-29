const express = require("express")
const orderController = require('../controllers/orderController')
const router = express.Router()
const {authMiddleware}=require('../middleware/authMiddleware')

router.use(authMiddleware)

router.route("/")
.get(orderController.getAllOrder)

router.route("/:id")
.get(orderController.getOrder)
.patch(orderController.updateOrderStatus)


module.exports = router