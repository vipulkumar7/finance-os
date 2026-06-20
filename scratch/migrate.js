const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Migrating existing payment modes to temporary/default values...");
  
  // Update HDFC_CREDIT_CARD -> OTHER_BANK
  const hdfc = await prisma.$executeRawUnsafe(
    `UPDATE "Expense" SET "paymentMode" = 'OTHER_BANK' WHERE "paymentMode" = 'HDFC_CREDIT_CARD'`
  );
  console.log(`Updated HDFC_CREDIT_CARD rows: ${hdfc}`);

  // Update SBI_CREDIT_CARD -> OTHER_BANK
  const sbi = await prisma.$executeRawUnsafe(
    `UPDATE "Expense" SET "paymentMode" = 'OTHER_BANK' WHERE "paymentMode" = 'SBI_CREDIT_CARD'`
  );
  console.log(`Updated SBI_CREDIT_CARD rows: ${sbi}`);

  // Update UPI -> OTHER_BANK
  const upi = await prisma.$executeRawUnsafe(
    `UPDATE "Expense" SET "paymentMode" = 'OTHER_BANK' WHERE "paymentMode" = 'UPI'`
  );
  console.log(`Updated UPI rows: ${upi}`);

  console.log("Done!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
