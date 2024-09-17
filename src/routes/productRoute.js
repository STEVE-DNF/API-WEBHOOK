const express = require("express")
const productController = require('../controllers/productController')
const router = express.Router()
const {authMiddleware}=require('../middleware/authMiddleware')
const {authRole}=require('../middleware/authRole')


router.use(authMiddleware)

router.route("/")
.get(productController.getAllProduct)
.post(authRole("admin"),productController.createProduct)

router.route("/:id")
.get(productController.getProduct)
.patch(authRole("admin"),productController.updateProduct)

router.use(authRole("admin"))

router.patch('/:id/active',productController.activeProduct)
router.patch('/:id/deactivate',productController.deleteProduct)

module.exports = router