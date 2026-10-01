import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "https://hfs-project-trzv.onrender.com";
export const API = `${BACKEND_URL}/api`;

const api = axios.create({ baseURL: API });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("hfs_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function apiError(err) {
  const detail = err?.response?.data?.detail;
  if (detail == null) return err?.message || "Something went wrong";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail.map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e))).join(" ");
  if (detail && typeof detail.msg === "string") return detail.msg;
  return String(detail);
}

export const inr = (n) =>
  "₹" + Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });

export const discountPct = (price, sale) =>
  sale && price > 0 ? Math.round(((price - sale) / price) * 100) : 0;

export default api;
