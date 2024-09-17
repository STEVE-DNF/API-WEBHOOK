const express = require("express")
const categoryController = require('../controllers/categoryController')
const router = express.Router()

const {authMiddleware}=require('../middleware/authMiddleware')
const {authRole}=require('../middleware/authRole')

router.use(authMiddleware)

router.route('/')
.get(categoryController.getAllCategory)
.post(authRole("admin"),categoryController.createCategory)

router.route('/:id')
.get(categoryController.getCategory)
.patch(authRole("admin"),categoryController.updateCategory)

router.use(authRole("admin"))

router.patch('/:id/active',categoryController.activeCategory)
router.patch('/:id/deactivate',categoryController.deleteCategory)

module.exports = router