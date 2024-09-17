const express = require("express");
const router = express.Router();
const whatsappController = require("../controllers/whatsappController");
const restaurantController = require("../controllers/restaurantController");

// Rutas para WhatsApp
router.get("/", whatsappController.WhatsappController.handleVerification);
router.post("/", whatsappController.WhatsappController.receivedMessage);

// Ruta para los restaurantes
router.post('/restaurant', restaurantController.createRestaurant);
router.put('/restaurant', restaurantController.updateRestaurant);
router.get('/restaurant/:restaurant_id', restaurantController.getRestaurant);
router.put('/restaurant/active/:restaurant_id', restaurantController.updateStateActiveRestaurant);
router.put('/restaurant/inactive/:restaurant_id', restaurantController.updateStateInactiveRestaurant);
router.put('/restaurant/pending/:restaurant_id', restaurantController.updateStatePendingRestaurant);
router.post('/restaurant/menu/:restaurant_id', restaurantController.addMenuRestaurant);
router.post('/restaurant/address/:restaurant_id', restaurantController.addAddressRestaurant);
router.get('/restaurant/menu/:restaurant_id', restaurantController.getMenuRestaurant);
router.get('/restaurant/address/:restaurant_id', restaurantController.getAddressRestaurant);
router.get('/products', restaurantController.getAllProduct);
router.delete('/restaurant/address/:restaurant_id/:address_id', restaurantController.removeAddressRestaurant);
router.delete('/restaurant/menu/:restaurant_id/:menu_id', restaurantController.removeMenuRestaurant);
router.get('/restaurant/time/:restaurant_id', restaurantController.getTimeRestaurant);


module.exports = router;
