// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pesapalRoute from "./pesapalRoute.js";



dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
connectDB();


// API Routes
app.use("/api/payment", pesapalRoute);


// Test route
app.get("/", (req, res) => {
  res.send("Pesapal Payment Backend Running 🎉");
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

