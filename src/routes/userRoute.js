const express = require("express")
const userController = require('../controllers/userController')
const router = express.Router()
const {authRole}=require('../middleware/authRole')
const {authMiddleware}=require('../middleware/authMiddleware')

router.use(authMiddleware)

router.route('/')
.get(userController.getMe,userController.getAllUser)

router.route('/getAllUser')
.get(authRole("admin","good"),userController.getAllUser)

router.post('/register',userController.register)
router.route('/getMe')
.get(userController.getMe,userController.getUser)

router.patch('/updatepassword',userController.getMe,userController.updatePasswordUser)
router.patch('/updatename',userController.getMe,userController.updateNameUser)
router.patch('/updaterole',authRole("admin"),userController.getMe,userController.updateRoleUser)

router.route('/:id')
.get(userController.getUser)

router.use(authRole("admin"))

router.patch('/:id/active',userController.activeUser)
router.patch('/:id/deactivate',userController.deleteUser)





module.exports = router