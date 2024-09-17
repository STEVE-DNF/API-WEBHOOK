const express = require("express")
const scheduleController = require('../controllers/scheduleController')
const router = express.Router()
const {authMiddleware}=require('../middleware/authMiddleware')
const {authRole}=require('../middleware/authRole')

router.use(authMiddleware)

router.use(authRole("admin"))

router.route("/",).
get(scheduleController.getMe,scheduleController.getAllSchedule)

router.route("/:id").
patch(scheduleController.updateSchedule)

router.route("/:id/active").
patch(scheduleController.activeSchedule)

router.route("/:id/deactivate").
patch(scheduleController.deleteSchedule)

module.exports = router
