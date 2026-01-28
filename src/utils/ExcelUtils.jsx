import * as XLSX from "xlsx";

/**
 * Import Excel file and format date columns for PostgreSQL
 * @param {File} file - Excel file
 * @param {Array} dateColumns - List of column names that should be treated as dates
 * @returns {Promise<Array>}
 */
export const importUsersFromExcel = (file, dateColumns = []) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Read Excel as raw to parse dates manually
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: true });

      const formattedData = jsonData.map((row) => {
        dateColumns.forEach((col) => {
          if (row[col] !== undefined && row[col] !== null) {
            // If Excel stored as a number (serial date)
            if (typeof row[col] === "number") {
              const d = XLSX.SSF.parse_date_code(row[col]);
              if (d) {
                row[col] = new Date(d.y, d.m - 1, d.d)
                  .toISOString()
                  .split("T")[0]; // YYYY-MM-DD
              }
            } else {
              // If already a string, try parsing to proper date
              const date = new Date(row[col]);
              if (!isNaN(date)) {
                row[col] = date.toISOString().split("T")[0]; // YYYY-MM-DD
              }
            }
          }
        });
        return row;
      });

      resolve(formattedData);
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
};
