import axios from "axios";

export const generatePivot = (rows) =>
  axios.post("http://127.0.0.1:5000/api/pivot/sku-date", rows);
