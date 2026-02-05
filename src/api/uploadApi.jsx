import axios from "axios";

// const BASE_URL = "http://localhost:5000/api/upload";
const BASE_URL = "https://reorder-point-backendcode.onrender.com/api/upload";

export const uploadFile = async (type, file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axios.post(
    `${BASE_URL}/${type}-direct`,
    formData
  );

  return response.data;
};
