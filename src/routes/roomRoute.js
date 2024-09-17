
const express = require("express")
const roomController = require('../controllers/roomController')
const sessionRoute = require('./sessionRoute')
const router = express.Router()

const {authMiddleware}=require('../middleware/authMiddleware')
const {authRole}=require('../middleware/authRole')

router.use(authMiddleware)



router.use('/:idRoom/sessions',sessionRoute)

router.route("/")
.get(roomController.getAllRoom)

router.route("/:id")
.get(roomController.getRoom)

module.exports = router