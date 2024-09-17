const express = require("express")

const sessionController = require('../controllers/sessionController')
const router = express.Router({ mergeParams: true });

const {authRole}=require('../middleware/authRole')

router.use(authRole('admin'))

router.route("/reconnectAll")
.patch(sessionController.reconnectAllSession)

router.route('/sign')
.post(sessionController.createSession)

router.route('/:idSession/reconnect',)
.patch(sessionController.reconnectSession)

router.route('/:idSession/logout',)
.delete(sessionController.logoutSession)

router.route('/:idSession/deactivate')
.patch(sessionController.deleteSession)

router.route('/:idSession/activate')
.patch(sessionController.activeSession)

router.route('/:idSession',)
.get(sessionController.getSession)

module.exports = router

