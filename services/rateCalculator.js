import { getUspsPrice } from "./uspsClient.js";
import { fetchVariantDimensions } from "./shopifyClient.js";

export async function getUspsRate(rateRequest) {
  const { items, origin, destination } = rateRequest;

  console.log("=== Fetching Variant Dimensions ===");

  // -----------------------------------------
  // 1. Compute total weight in pounds
  // -----------------------------------------
  const totalGrams = items.reduce(
    (sum, item) => sum + (item.grams || 0) * item.quantity,
    0
  );

  const weightLb = Math.max(0.1, totalGrams / 453.592);
  console.log("Total Weight (lb):", weightLb.toFixed(2));

  // -----------------------------------------
  // 2. Collect dimensions for every item
  // -----------------------------------------
  let totalLength = 0;
  let totalWidth = 0;
  let totalHeight = 0;

  for (const item of items) {
    const variantId = item.variant_id;

    try {
      const { length, width, height } = await fetchVariantDimensions(variantId);

      console.log(`Variant ${variantId} Dimensions:`, {
        length,
        width,
        height,
      });

      // Add dimensions × quantity
      const qty = item.quantity;

      totalLength += (length || 10) * qty;
      totalWidth += (width || 6) * qty;
      totalHeight += (height || 4) * qty;

    } catch (err) {
      console.error(
        `Error fetching metafields for variant ${variantId}:`,
        err.message
      );

      // Fallback dimensions
      const qty = item.quantity;
      totalLength += 10 * qty;
      totalWidth += 6 * qty;
      totalHeight += 4 * qty;
    }
  }

  // Log accumulated dimensions
  console.log("=== Total Package Dimensions ===");
  console.log({ totalLength, totalWidth, totalHeight });

  // -----------------------------------------
  // 3. USPS request body
  // -----------------------------------------
  const uspsRequestBody = {
    originZIPCode: origin.postal_code,
    destinationZIPCode: destination.postal_code,

    weight: Number(weightLb.toFixed(2)),
    length: totalLength,
    width: totalWidth,
    height: totalHeight,

    mailClass: "USPS_GROUND_ADVANTAGE",
    processingCategory: "MACHINABLE",
    rateIndicator: "SP",
    destinationEntryFacilityType: "NONE",
    priceType: "COMMERCIAL",

    mailingDate: new Date().toISOString().substring(0, 10),
    hasNonstandardCharacteristics: false,
  };

  console.log("USPS request:", uspsRequestBody);

  // -----------------------------------------
  // 4. Get USPS price
  // -----------------------------------------
  const uspsPriceUSD = await getUspsPrice(uspsRequestBody);

  const priceCents = Math.round(uspsPriceUSD * 100);

  // -----------------------------------------
  // 5. Shopify rate response
  // -----------------------------------------
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
