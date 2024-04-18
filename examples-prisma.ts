import { prisma } from "./db";

async function main() {
  await prisma.user.deleteMany({});
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    if (e.code === "P2002") {
      console.error("Error", "Email already exists");
    }
    await prisma.$disconnect();
    process.exit(1);
  });
