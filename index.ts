import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
async function main() {
  const res = await prisma.user.create({
    data: {
      name: "Victoria",
      email: "victoria@prisma.io",
      posts: {
        create: { title: "Bye World" },
      },
    },
  });

  const allUsers = await prisma.user.findMany({
    include: {
      posts: true,
    },
  });
  console.dir(allUsers, { depth: null });
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    /* if (e.code === "P2002") {
      console.error("Error", "Email already exists");
    } */
    await prisma.$disconnect();
    process.exit(1);
  });
