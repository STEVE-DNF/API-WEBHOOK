const express = require("express")
const modelController = require('../controllers/modelController')
const router = express.Router()
const {authMiddleware}=require('../middleware/authMiddleware')
const {authRole}=require('../middleware/authRole')

router.use(authMiddleware)

router.route('/stopModel')
.patch(authRole("admin"),modelController.stopContainer)

router.route('/startModel')
.patch(authRole("admin"),modelController.startContainer)

router.route('/trainModel')
.post(authRole("admin"),modelController.trainModel)

router.route('/statusModel')
.get(authRole("admin"),modelController.statusModel)

router.route('/createModel')
.post(authRole("admin"),modelController.createContainer)


router.use(authRole("good"))

router.route('/listModel')
.get(modelController.listContainers)

router.route('/startAllModels')
.patch(modelController.startAllContainers)





module.exports = router