
import axios from "axios";
import "dotenv/config";

//credenciais e endpoint do .env
const AUTH_URL = process.env.AUTH_URL;
const CLIENT_ID = process.env.SNK_CLIENT_ID;
const CLIENT_SECRET = process.env.SNK_CLIENT_SECRET;
const X_TOKEN = process.env.SNK_X_TOKEN;

// cache em memória simples
let tokenCache = {
  accessToken: null,
  expAt: 0 
};

//renovar antes de expirar
const SAFETY_WINDOW_SECONDS = 30;

/**
 * Obtém um access_token via OAuth2 Client Credentials no endpoint /authenticate.
 * Mantém cache em memória até expirar.
 */
export async function getAccessToken() {
  const now = Math.floor(Date.now() / 1000);
  if (tokenCache.accessToken && now < tokenCache.expAt - SAFETY_WINDOW_SECONDS) {
    return tokenCache.accessToken;
  }

  const params = new URLSearchParams();
  params.set("grant_type", "client_credentials");
  params.set("client_id", CLIENT_ID);
  params.set("client_secret", CLIENT_SECRET);

  const { data } = await axios.post(AUTH_URL, params, {
    headers: {
      "X-Token": X_TOKEN,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    timeout: 15000
  });

  if (!data?.access_token) {
    throw new Error("Falha ao obter access_token (resposta sem token).");
  }

  const expiresIn = Number(data.expires_in ?? 300); // fallback 5 min
  tokenCache = {
    accessToken: data.access_token,
    expAt: Math.floor(Date.now() / 1000) + expiresIn
  };

  return tokenCache.accessToken;
}
