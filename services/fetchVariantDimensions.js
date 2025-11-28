import axios from "axios";
import { getShopifyAccessToken } from "./shopifyClient.js";

export async function fetchVariantDimensions(variantId) {
  const url = `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/graphql.json`;

  const token = await getShopifyAccessToken();

  const query = `
    query VariantDimensions($id: ID!) {
      productVariant(id: $id) {
        id
        length: metafield(namespace: "custom", key: "length") { value }
        width: metafield(namespace: "custom", key: "width") { value }
        height: metafield(namespace: "custom", key: "height") { value }
      }
    }
  `;

  const response = await axios.post(
    url,
    { query, variables: { id: `gid://shopify/ProductVariant/${variantId}` } },
    {
      headers: {
        "X-Shopify-Access-Token": token,
        "Content-Type": "application/json"
      }
    }
  );

  const variant = response.data.data.productVariant;

  return {
    length: variant.length?.value ? Number(variant.length.value) : null,
    width: variant.width?.value ? Number(variant.width.value) : null,
    height: variant.height?.value ? Number(variant.height.value) : null,
  };
}
