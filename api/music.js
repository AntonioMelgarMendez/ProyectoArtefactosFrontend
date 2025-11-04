import axios from "axios";
import { CLIENT_ID, CLIENT_SECRET } from "../config";

let cachedToken = null;

export async function getAccessToken() {
  if (cachedToken) return cachedToken;
  const body = new URLSearchParams();
  body.append("grant_type", "client_credentials");
  const { data } = await axios.post("https://accounts.spotify.com/api/token", body, {
    headers: {
      Authorization: "Basic " + btoa(`${CLIENT_ID}:${CLIENT_SECRET}`),
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  cachedToken = data.access_token;
  setTimeout(() => (cachedToken = null), 3600 * 1000);
  return cachedToken;
}

export async function getNewReleases() {
  const token = await getAccessToken();
  const { data } = await axios.get("https://api.spotify.com/v1/browse/new-releases", {
    headers: { Authorization: `Bearer ${token}` },
    params: { country: "US", limit: 10 },
  });
  return data.albums.items;
}
export async function searchTracks(query) {
  const token = await getAccessToken();
  const { data } = await axios.get("https://api.spotify.com/v1/search", {
    headers: { Authorization: `Bearer ${token}` },
    params: {
      q: query,
      type: "track",
      limit: 10,
    },
  });
  return data.tracks.items;
}