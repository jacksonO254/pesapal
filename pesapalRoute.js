// pesapalRoute.js
import express from "express";
import {
  getPesapalToken,
  pesapalPay,
  verifyPesapalPayment
} from "./pesapalController.js";

const router = express.Router();

/**
 * 1️⃣ Test Pesapal Token
 * URL: GET /api/payment/test-token
 */
router.get("/test-token", async (req, res) => {
  try {
    const token = await getPesapalToken();
    res.json({ success: true, token });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

/**
 * 2️⃣ Create Payment
 * URL: POST /api/payment/pay
 */
router.post("/pay", pesapalPay);

/**
 * 3️⃣ Verify Payment (Pesapal callback)
 * URL example:
 * /api/payment/verify?OrderTrackingId=xxxxxx
 */
router.get("/verify", verifyPesapalPayment);

export default router;
