import * as XLSX from "xlsx";

export const readExcel = (file) =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = e => {
      const workbook = XLSX.read(e.target.result, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      resolve(XLSX.utils.sheet_to_json(sheet));
    };
    reader.readAsArrayBuffer(file);
  });

export const exportExcel = (rows) => {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Pivot");
  XLSX.writeFile(wb, "SKU_Pivot.xlsx");
};
