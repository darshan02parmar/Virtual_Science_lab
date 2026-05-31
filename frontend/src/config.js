const raw = import.meta.env.VITE_API_URL || "https://funlab-theta.vercel.app";
const API_URL = raw.endsWith("/") ? raw.slice(0, -1) : raw;
export default API_URL;