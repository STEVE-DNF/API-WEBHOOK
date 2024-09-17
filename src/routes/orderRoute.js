const express = require("express")
const orderController = require('../controllers/orderController')
const router = express.Router()
const {authMiddleware}=require('../middleware/authMiddleware')

router.use(authMiddleware)

router.route("/")
.get(orderController.getAllOrder)
.post(orderController.test)

router.route("/:id")
.get(orderController.getOrder)


module.exports = router