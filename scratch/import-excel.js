const XLSX = require("xlsx");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Helper to convert Excel serial date to JS Date
function excelDateToJSDate(serial) {
  if (!serial || isNaN(serial)) return new Date();
  const utc_days = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400;
  const date_info = new Date(utc_value * 1000);
  return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate());
}

// Map Excel category strings to ExpenseCategory enums
function mapCategory(catStr, itemDetails) {
  const s = (catStr || "").trim().toLowerCase();
  const item = (itemDetails || "").trim().toLowerCase();

  // Keyword check first
  if (item.includes("petrol") || item.includes("i20") || s.includes("i20") || s.includes("petrol") || s.includes("fuel") || s.includes("service")) {
    return "VEHICLE";
  }
  if (item.includes("internet") || item.includes("wifi") || item.includes("bsnl") || item.includes("electricity") || item.includes("bill") || s.includes("bill") || s.includes("rent") || s.includes("hra") || s.includes("pg rent")) {
    return "BILLS";
  }

  // Category mapping
  if (s.includes("grocery") || s.includes("instamart") || s.includes("bigbasket") || s.includes("zepto") || s.includes("blinkit")) {
    if (s.includes("online") || item.includes("instamart") || item.includes("zepto") || item.includes("blinkit")) {
      return "GROCERY_ONLINE";
    }
    return "GROCERY_OFFLINE";
  }
  if (s.includes("meat") || s.includes("chicken") || s.includes("mutton") || s.includes("fish")) {
    return "MEAT";
  }
  if (s.includes("medicine") || s.includes("medical") || s.includes("doctor") || s.includes("pharmacy")) {
    return "MEDICAL";
  }
  if (s.includes("shopping") || s.includes("amazon") || s.includes("flipkart")) {
    return "SHOPPING";
  }
  if (s.includes("travel") || s.includes("cab") || s.includes("uber") || s.includes("rapido") || s.includes("ola") || s.includes("flight") || s.includes("auto")) {
    return "TRAVEL";
  }
  if (s.includes("food") || s.includes("eat out") || s.includes("eating out") || s.includes("restaurant") || s.includes("swiggy") || s.includes("zomato") || s.includes("ondc") || s.includes("hungerbox")) {
    return "EATING_OUT";
  }
  if (s.includes("snacks") || s.includes("tea") || s.includes("coffee") || s.includes("samosa") || s.includes("chips") || s.includes("juice")) {
    return "SNACKS";
  }
  if (s.includes("fruits") || s.includes("apple") || s.includes("banana")) {
    return "FRUITS";
  }
  if (s.includes("vegetables") || s.includes("tomato") || s.includes("potato")) {
    return "VEGETABLES";
  }
  if (s.includes("sweets") || s.includes("chocolate") || s.includes("ice cream")) {
    return "SWEETS";
  }
  
  return "OTHERS";
}

// Map Excel payment mode strings to PaymentMode enums
function mapPaymentMode(modeStr) {
  const s = (modeStr || "").trim().toLowerCase();
  if (s.includes("jio")) return "JIO";
  if (s.includes("hdfc cc") || s.includes("hdfc credit card") || s.includes("hdfc")) return "HDFC_CC";
  if (s.includes("yes bank") || s.includes("yes")) return "YES_BANK_CC";
  if (s.includes("sbi cc") || s.includes("sbi credit card") || s.includes("sbi")) return "SBI_CC";
  if (s.includes("amazon")) return "AMAZON_GIFT_CARD";
  if (s.includes("flipkart")) return "FLIPKART_GIFT_CARD";
  if (s.includes("phonepe") || s.includes("phone pay")) return "PHONE_PAY_GIFT_CARD";
  if (s.includes("cash")) return "CASH";
  if (s.includes("pluxee") || s.includes("sodexo")) return "PLUXEE";
  if (s.includes("payzapp")) return "PAYZAPP";
  
  // Default fallback
  return "OTHER_BANK";
}

// Map vehicle expense type
function mapVehicleType(itemDetails, categoryStr) {
  const item = (itemDetails || "").toLowerCase();
  if (item.includes("service") || item.includes("repair") || item.includes("mechanic")) return "SERVICE";
  if (item.includes("insurance")) return "INSURANCE";
  if (item.includes("wash")) return "WASHING";
  if (item.includes("park")) return "PARKING";
  
  // Default to FUEL (petrol/i20)
  return "FUEL";
}

async function main() {
  console.log("Starting Google Sheets (Excel) import...");

  // Find or create user
  const email = process.env.ALLOWED_EMAIL || "vipul.abd@gmail.com";
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.log(`User ${email} not found. Creating user...`);
    user = await prisma.user.create({
      data: {
        email,
        name: "ABD",
      },
    });
  }
  const userId = user.id;
  console.log(`Importing data for User ID: ${userId} (${email})`);

  // Clear existing expense and vehicle expense records for clean slate
  console.log("Cleaning up existing expense and vehicle expense records...");
  await prisma.vehicleExpense.deleteMany({ where: { userId } });
  await prisma.expense.deleteMany({ where: { userId } });
  console.log("Existing records cleared.");

  const filePath = path.join(__dirname, "../expense.xlsx");
  const workbook = XLSX.readFile(filePath);
  
  let totalExpensesCreated = 0;
  let totalVehicleExpensesCreated = 0;

  // Process each sheet
  for (const sheetName of workbook.SheetNames) {
    console.log(`Processing sheet: ${sheetName}`);
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    if (rows.length === 0) continue;

    // Find the header row index and column positions
    let headerRowIdx = -1;
    let colIndices = {
      date: -1,
      item: -1,
      amount: -1,
      category: -1,
      mode: -1
    };

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!Array.isArray(row)) continue;

      const dateIdx = row.findIndex(cell => cell && String(cell).trim().toLowerCase() === "date");
      const itemIdx = row.findIndex(cell => cell && (String(cell).trim().toLowerCase().includes("item") || String(cell).trim().toLowerCase().includes("details")));
      const amountIdx = row.findIndex(cell => cell && String(cell).trim().toLowerCase() === "amount");

      if (dateIdx !== -1 && itemIdx !== -1 && amountIdx !== -1) {
        headerRowIdx = i;
        colIndices.date = dateIdx;
        colIndices.item = itemIdx;
        colIndices.amount = amountIdx;
        colIndices.category = row.findIndex(cell => cell && String(cell).trim().toLowerCase() === "category");
        colIndices.mode = row.findIndex(cell => cell && (String(cell).trim().toLowerCase() === "mode" || String(cell).trim().toLowerCase() === "apps"));
        break;
      }
    }

    if (headerRowIdx === -1) {
      console.log(`Could not find header row in sheet: ${sheetName}`);
      continue;
    }

    // Now process data rows starting after headerRowIdx
    for (let i = headerRowIdx + 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;

      const dateSerial = row[colIndices.date];
      const item = row[colIndices.item];
      const amountRaw = row[colIndices.amount];
      const categoryStr = colIndices.category !== -1 ? row[colIndices.category] : "Others";
      const modeStr = colIndices.mode !== -1 ? row[colIndices.mode] : "Cash";

      const amount = Number(amountRaw);

      if (!item || !dateSerial || isNaN(amount) || amount <= 0) {
        continue;
      }

      const date = excelDateToJSDate(dateSerial);
      const category = mapCategory(categoryStr, item);
      const paymentMode = mapPaymentMode(modeStr);

      // Filter out HRA, Rent, or PG Rent after October 2024
      const itemLower = String(item).toLowerCase();
      const isRent = itemLower.includes("hra") || itemLower.includes("rent") || itemLower.includes("house rent") || itemLower.includes("flat rent") || itemLower.includes("pg rent");
      const cutoffDate = new Date(2024, 10, 1); // November 1, 2024
      if (isRent && date >= cutoffDate) {
        console.log(`Skipping rent expense after Oct 2024: "${item}" on ${date.toISOString().split("T")[0]} (₹${amount})`);
        continue;
      }

      // Create Expense
      const expense = await prisma.expense.create({
        data: {
          date,
          item: String(item),
          amount,
          category,
          paymentMode,
          userId,
        },
      });
      totalExpensesCreated++;

      // Conditionally create VehicleExpense
      if (category === "VEHICLE") {
        const vehicleType = mapVehicleType(String(item), categoryStr);
        await prisma.vehicleExpense.create({
          data: {
            date,
            amount,
            type: vehicleType,
            notes: String(item),
            userId,
            expenseId: expense.id,
          },
        });
        totalVehicleExpensesCreated++;
      }
    }
  }

  console.log(`\nImport complete!`);
  console.log(`Total Expenses created: ${totalExpensesCreated}`);
  console.log(`Total Vehicle Expenses linked/created: ${totalVehicleExpensesCreated}`);
}

main()
  .catch((e) => {
    console.error("Import failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
