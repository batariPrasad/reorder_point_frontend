// import axios from "axios";

// const BASE_URL = "https://reorder-point-backendcode.onrender.com";

// export const generateReorder = () =>
//   axios.post(`${BASE_URL}/api/reorder/generate`);

// export const getReorderTable = () =>
//   axios.get(`${BASE_URL}/api/reorder/list`);
// import axios from "axios";

// const api = axios.create({
//   baseURL: "https://reorder-point-backendcode.onrender.com/api",
// });

// export const syncInventory = () => api.post("/sync/inventory");
// export const syncOrders = () => api.post("/sync/orders");
// export const generateReorder = () => api.post("/generate");
// export const fetchReorder = () => api.get("/reorder");


import axios from "axios";

// const API = axios.create({ baseURL: "https://reorder-point-backendcode.onrender.com/api/reorder" });


export const fetchReorder = (warehouse) => {
  return axios.get(
    `https://reorder-point-backendcode.onrender.com/api/reorder`,
    {
      params: { warehouse }
    }
  );
};

export const generateReorder = () =>
  axios.post("https://reorder-point-backendcode.onrender.com/api/reorder/generate");

export const syncInventory = () =>
  axios.post("https://reorder-point-backendcode.onrender.com/api/reorder/upload/inventory");

export const syncOrders = () =>
  axios.post("https://reorder-point-backendcode.onrender.com/api/reorder/upload/orders");
