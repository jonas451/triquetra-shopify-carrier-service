import axios from "axios";

let cachedToken = null;
let tokenExpiresAt = null;

export async function getShopifyAccessToken() {
  const now = Date.now();

  // Reuse valid token
  if (cachedToken && tokenExpiresAt && now < tokenExpiresAt) {
    return cachedToken;
  }

  const url = `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/oauth/access_token`;

  const payload = {
    client_id: process.env.SHOPIFY_CLIENT_ID,
    client_secret: process.env.SHOPIFY_CLIENT_SECRET,
    grant_type: "client_credentials"
  };

  try {
    const response = await axios.post(url, payload, {
      headers: { "Content-Type": "application/json" }
    });

    const { access_token, expires_in } = response.data;

    cachedToken = access_token;
    tokenExpiresAt = now + expires_in * 1000;

    console.log("Shopify Admin Access Token retrieved.");
    return cachedToken;

  } catch (err) {
    console.error("Shopify OAuth Error:", err.response?.data || err.message);
    throw new Error("Failed to fetch Shopify Admin API token");
  }
}
