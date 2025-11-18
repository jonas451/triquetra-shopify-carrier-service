import express from "express";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(express.json()); // Shopify sends JSON POST

// Shopify CarrierService endpoint
app.post("/carrier-service", (req, res) => {
  console.log("Shopify Request Received:");
  console.log(JSON.stringify(req.body, null, 2));

  // Always return "Shipping 1" with $70
  const rates = [
    {
      service_name: "Shipping 1",
      description: "Fast and reliable shipping",
      service_code: "SHIPPING_1",
      total_price: "7000", // Price in cents
      currency: "USD",
      min_delivery_date: new Date().toISOString(),
      max_delivery_date: new Date(
        Date.now() + 2 * 24 * 60 * 60 * 1000
      ).toISOString(), // +2 days
    },
  ];

  return res.json({ rates });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
