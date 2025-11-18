import express from "express";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(express.json()); // Shopify sends JSON POST

// Shopify CarrierService endpoint
app.post("/carrier-service", (req, res) => {
  console.log("Shopify Request Received:");
  console.log(JSON.stringify(req.body, null, 2));

  // For now send an empty rates array (to avoid Shopify errors)
  return res.json({
    rates: []
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
