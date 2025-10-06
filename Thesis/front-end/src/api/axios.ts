import axios from "axios";

const api = axios.create({
  baseURL: "https://localhost:7269/swagger/index.html", // your API base URL
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
