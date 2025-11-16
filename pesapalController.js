// pesapalController.js
import axios from "axios";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const TOKEN_URL = "https://pay.pesapal.com/v3/api/Auth/RequestToken";
const ORDER_URL = "https://pay.pesapal.com/v3/api/Transactions/SubmitOrderRequest";
const VERIFY_URL = "https://pay.pesapal.com/v3/api/Transactions/GetTransactionStatus";

/**
 * 1️⃣ GET PESAPAL TOKEN
 */
export const getPesapalToken = async () => {
  const res = await axios.post(TOKEN_URL, {
    consumer_key: process.env.PESAPAL_CONSUMER_KEY,
    consumer_secret: process.env.PESAPAL_CONSUMER_SECRET,
  });

  return res.data.token;
};

/**
 * 2️⃣ CREATE PESAPAL ORDER & RETURN REDIRECT URL
 */
export const pesapalPay = async (req, res) => {
  try {
    // 1. Get Token
    const token = await getPesapalToken();
    if (!token) {
      return res.status(500).json({ success: false, message: "Failed to retrieve token" });
    }

    // 2. Create Order Payload
    const orderRequest = {
      id: crypto.randomUUID(), // internal unique ID
      currency: "KES",
      amount: req.body.amount,
      description: req.body.description || "Order Payment",
      callback_url: process.env.PESAPAL_CALLBACK_URL,
      notification_id: crypto.randomUUID(), // random notification ID
      billing_address: {
        email_address: req.body.email,
        phone_number: req.body.phone,
        country_code: "KE",
        first_name: req.body.firstName,
        last_name: req.body.lastName,
      }
    };

    // 3. Send to Pesapal
    const pesapalResponse = await axios.post(ORDER_URL, orderRequest, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return res.json({
      success: true,
      redirect_url: pesapalResponse.data.redirect_url,
    });

  } catch (error) {
    console.log("PESAPAL ERROR:", error.response?.data || error.message);
    res.status(500).json({ success: false, message: "Payment Failed" });
  }
};

/**
 * 3️⃣ VERIFY PESAPAL PAYMENT
 */
export const verifyPesapalPayment = async (req, res) => {
  try {
    const token = await getPesapalToken();
    const { OrderTrackingId } = req.query;

    const verifyResponse = await axios.get(
      `${VERIFY_URL}?orderTrackingId=${OrderTrackingId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const status = verifyResponse.data.payment_status_description;

    console.log("PESAPAL PAYMENT STATUS:", status);

    if (status === "Completed" || status === "COMPLETED") {
      return res.redirect("/payment-success");
    } else {
      return res.redirect("/payment-failed");
    }

  } catch (error) {
    console.log("VERIFY ERROR:", error.response?.data || error.message);
    res.redirect("/payment-failed");
  }
};
