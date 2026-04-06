import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "https://offerly-ijbn.onrender.com/api",
});

export default API;
