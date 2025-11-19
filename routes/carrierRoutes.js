import express from "express";
import { getUspsRate } from "../services/rateCalculator.js";

const router = express.Router();

router.post("/", async (req, res) => {
  console.log("Shopify Request Received:");
  console.log(JSON.stringify(req.body, null, 2));

  try {
    const rate = await getUspsRate(req.body.rate);

    return res.json({ rates: [rate] });
  } catch (err) {
    console.error("USPS Rate Error:", err);

    // Fallback rate so Shopify checkout never breaks
    return res.json({
      rates: [
        {
          service_name: "Fallback Shipping",
          service_code: "FALLBACK",
          total_price: "10000",
          currency: "USD",
        },
      ],
    });
  }
});

export default router;
