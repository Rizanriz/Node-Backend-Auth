const { signup, login ,verifyOtp ,resendOtp} = require("../controllers/auth");
const express = require("express")

const router = express.Router()

router.post("/signup",signup)

router.post("/login",login)

router.post("/verifotp",verifyOtp)

router.post("/resend-otp",resendOtp)

module.exports =  router