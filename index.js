import express from "express";
import dotenv from "dotenv";
import carrierRoutes from "./routes/carrierRoutes.js";

dotenv.config();
const app = express();

app.use(express.json());

// Carrier service endpoint
app.use("/carrier-service", carrierRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
