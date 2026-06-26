const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
p.user.findMany({ include: { _count: true } })
  .then(u => {
    console.log("USERS AND COUNTS:");
    console.log(JSON.stringify(u, null, 2));
  })
  .catch(console.error)
  .finally(() => p.$disconnect());
