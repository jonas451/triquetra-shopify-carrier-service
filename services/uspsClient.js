import axios from "axios";

let cachedToken = null;
let tokenExpiresAt = null;

/**
 * Retrieve OAuth2 access token using client_credentials flow
 */
async function getAccessToken() {
  const now = Date.now();

  // Reuse valid token
  if (cachedToken && tokenExpiresAt && now < tokenExpiresAt) {
    return cachedToken;
  }

  const tokenUrl = `${process.env.USPS_API_BASE}/oauth2/v3/token`;

  const params = new URLSearchParams();
  params.append("grant_type", "client_credentials");
  params.append("scope", "prices");

  const authHeader =
    "Basic " +
    Buffer.from(
      `${process.env.USPS_CLIENT_ID}:${process.env.USPS_CLIENT_SECRET}`
    ).toString("base64");

  const response = await axios.post(tokenUrl, params, {
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  const { access_token, expires_in } = response.data;

  cachedToken = access_token;
  tokenExpiresAt = now + expires_in * 1000;

  return cachedToken;
}

/**
 * Call USPS Domestic Prices (3.4.24) API
 */
export async function getUspsPrice(requestBody) {
  const token = await getAccessToken();

  const url = `${process.env.USPS_API_BASE}/prices/v3/base-rates/search`;

  const response = await axios.post(url, requestBody, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  const price =
    response?.data?.prices?.[0]?.totalBasePrice?.amount ??
    response?.data?.prices?.[0]?.totalPrice?.amount ??
    null;

  if (!price) {
    console.error("USPS Price Response:", response.data);
    throw new Error("No price returned by USPS");
  }

  return Number(price);
}
