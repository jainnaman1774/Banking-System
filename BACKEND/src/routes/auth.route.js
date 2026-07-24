const express = require("express")
const authController = require("../controllers/auth.controller")

const router = express.Router()

router.post("/register",authController.userRegisterController)

//  /api/auth/login
router.post("/login",authController.userLoginController)

router.post("/logOut",authController.userLogoutController)

module.exports = router