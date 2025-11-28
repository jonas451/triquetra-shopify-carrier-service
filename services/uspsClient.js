import axios from "axios";

let cachedToken = null;
let tokenExpiresAt = null;

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
