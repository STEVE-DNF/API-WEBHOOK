const express = require("express")
const restaurantController = require('../controllers/restaurantController')
const paymentRoute = require('./paymentRoute')
const router = express.Router()
const {authMiddleware}=require('../middleware/authMiddleware')
const {authRole}=require('../middleware/authRole')


router.use(authMiddleware)
router.route("/")
.get(authRole("good","admin"),restaurantController.getAllRestaurant)

router.route("/menus")
.get(restaurantController.getAllMenuRestaurant)
.post(restaurantController.createMenuRestaurant);


router.route("/address")
.patch(authRole("admin"),restaurantController.createOrUpdteAddress)

router.route("/changeName")
.patch(authRole("admin"),restaurantController.updateName)

router.route("/getMe")
.get(restaurantController.getMe,restaurantController.getRestaurant)

router.route("/:id")
.get(restaurantController.getRestaurant)
.patch(authRole("admin"),restaurantController.updateRestaurant)

router.use(authRole("admin"))

router.route("/:menuId/menu")
.patch(restaurantController.updateMenuRestaurant)
.delete(restaurantController.deleteMenuRestaurant);

router.patch('/:id/active',restaurantController.activeRestaurant)
router.patch('/:id/deactivate',restaurantController.deleteRestaurant)





module.exports = router