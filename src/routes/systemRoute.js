const express = require("express")
const systemController = require('../controllers/systemController')
const router = express.Router()
const {authMiddleware}=require('../middleware/authMiddleware')
const {authRole}=require('../middleware/authRole')


router.use(authMiddleware)

router.route("/")
.get(authRole("good","admin"),systemController.getAllSystem)


router.route("/getMe")
.get(authRole("admin"),systemController.getMe,systemController.getSystem)

router.route("/changeName")
.patch(authRole("admin"),systemController.getMe,systemController.changeName)

router.route("/changeConfig")
.patch(authRole("admin"),systemController.getMe,systemController.changeConfig)

router.use(authRole("good","admin"))

router.route("/:id")
.get(systemController.getSystem)

router.patch('/:id/active',systemController.activeSystem)
router.patch('/:id/deactivate',systemController.deleteSystem)





module.exports = router