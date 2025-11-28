import axios from "axios";

let cachedToken = null;
let tokenExpiresAt = null;

/**
 * Retrieve OAuth2 access token using client_credentials flow
 */
async function getAccessToken() {
  const now = Date.now();

  if (cachedToken && tokenExpiresAt && now < tokenExpiresAt) {
    return cachedToken;
  }

  const tokenUrl = `${process.env.USPS_API_BASE}/oauth2/v3/token`;

  const form = new URLSearchParams();
  form.append("grant_type", "client_credentials");
  form.append("client_id", process.env.USPS_CLIENT_ID);
  form.append("client_secret", process.env.USPS_CLIENT_SECRET);
  form.append("scope", "prices");

  try {
    const response = await axios.post(tokenUrl, form, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
    });

    const { access_token, expires_in } = response.data;

    cachedToken = access_token;
    tokenExpiresAt = now + expires_in * 1000;

    console.log("Access Token retrieved successfully.");
    return cachedToken;
  } catch (error) {
    console.error("USPS OAuth Error:", error.response?.data || error.message);
    throw new Error("Failed to retrieve USPS access token");
  }
}

/**
 * Call USPS Domestic Prices (3.4.24) API
 */
export async function getUspsPrice(requestBody) {
  const token = await getAccessToken();

  const url = `${process.env.USPS_API_BASE}/prices/v3/base-rates/search`;

  try {
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
  } catch (error) {
    if (error.response) {
      console.error("USPS Price API Error:", error.response.status, error.response.data);
    } else {
      console.error("Request Error:", error.message);
    }
    throw new Error("Failed to retrieve USPS price");
  }
}
