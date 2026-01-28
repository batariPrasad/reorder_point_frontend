import axios from "axios";

const BASE_URL = "https://reorder-point-backendcode.onrender.com";

// Upload Excel file (FormData) to backend
export const uploadFile = (type, file) => {
  const formData = new FormData();
  formData.append("file", file); // Must be "file"

  return axios.post(`${BASE_URL}/api/upload/${type}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
