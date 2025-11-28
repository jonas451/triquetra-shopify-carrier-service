import axios from "axios";

export async function fetchVariantDimensions(variantId) {
  const url = `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/graphql.json`;

  const query = `
    query VariantDimensions($id: ID!) {
      productVariant(id: $id) {
        id
        length: metafield(namespace: "custom", key: "length") {
          value
        }
        width: metafield(namespace: "custom", key: "width") {
          value
        }
        height: metafield(namespace: "custom", key: "height") {
          value
        }
      }
    }
  `;

  const response = await axios.post(
    url,
    { query, variables: { id: `gid://shopify/ProductVariant/${variantId}` } },
    {
      headers: {
        "X-Shopify-Access-Token":
          process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN,
        "Content-Type": "application/json",
      },
    }
  );

  const variant = response.data.data.productVariant;

  // Convert metafield values to numbers (or null)
  const length = variant.length?.value ? Number(variant.length.value) : null;
  const width = variant.width?.value ? Number(variant.width.value) : null;
  const height = variant.height?.value ? Number(variant.height.value) : null;

  console.log("📦 Variant Dimensions:");
  console.log({ variantId, length, width, height });

  return { length, width, height };
}
