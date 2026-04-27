// Single source of truth for the backend URL.
// To override in production, set VITE_API_URL in your .env file.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default API_URL;
