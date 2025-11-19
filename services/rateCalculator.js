import { getUspsPrice } from "./uspsClient.js";

export async function getUspsRate(rateRequest) {
  const { items, origin, destination } = rateRequest;

  // -----------------------------
  // 1. Compute total weight in pounds
  // -----------------------------
  const totalGrams = items.reduce(
    (sum, item) => sum + (item.grams || 0) * item.quantity,
    0
  );

  const weightLb = Math.max(0.1, totalGrams / 453.592); // must be > 0

  // -----------------------------
  // 2. Dummy dimensions
  // -----------------------------
  const length = 10;
  const width = 6;
  const height = 4;

  // -----------------------------
  // 3. Build USPS JSON Body
  // -----------------------------
  const uspsRequestBody = {
    originZIPCode: origin.postal_code,
    destinationZIPCode: destination.postal_code,
    weight: Number(weightLb.toFixed(2)),
    length,
    width,
    height,

    // Required USPS fields
    mailClass: "USPS_GROUND_ADVANTAGE",
    processingCategory: "MACHINABLE",
    rateIndicator: "SP", // Single Piece
    destinationEntryFacilityType: "NONE",
    priceType: "COMMERCIAL",

    mailingDate: new Date().toISOString().substring(0, 10), // YYYY-MM-DD
    hasNonstandardCharacteristics: false,
  };

  console.log("USPS request:", uspsRequestBody);

  // -----------------------------
  // 4. Call USPS API
  // -----------------------------
  const uspsPriceUSD = await getUspsPrice(uspsRequestBody);

  const priceCents = Math.round(uspsPriceUSD * 100);

  // -----------------------------
  // 5. Build Shopify rate response
  // -----------------------------
  return {
    service_name: "USPS Priority Mail",
    description: "Live USPS rate",
    service_code: "USPS_PRIORITY_MAIL",
    total_price: priceCents.toString(),
    currency: "USD",
    min_delivery_date: new Date().toISOString(),
    max_delivery_date: new Date(Date.now() + 3 * 86400000).toISOString(),
  };
}
