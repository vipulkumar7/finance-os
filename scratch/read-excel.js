const XLSX = require("xlsx");
const path = require("path");

function main() {
  const filePath = path.join(__dirname, "../expense.xlsx");
  console.log(`Reading Excel file: ${filePath}`);
  
  const workbook = XLSX.readFile(filePath);
  console.log("Sheet names in workbook:", workbook.SheetNames);
  
  workbook.SheetNames.forEach((sheetName) => {
    console.log(`\n--- Sheet: ${sheetName} ---`);
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    console.log("Total rows:", data.length);
    console.log("First 5 rows:");
    data.slice(0, 10).forEach((row, i) => {
      console.log(`Row ${i + 1}:`, row);
    });
  });
}

main();
