const express = require("express");
const { prisma } = require("../db");
const router = express.Router();

router.get("/", async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});
router.get("/onboarding", async (req, res) => {
  const requestBody = req.body;
  if (!requestBody) return res.status(400).send("No body");
  try {
    const { journey, ambitions, technologies, id } = requestBody;
    const updatedUser = await prisma.user.upsert({
      where: {
        id,
      },
      create: {
        journey,
        ambitions,
        technologies,
      },
    });
    return res.status(201).json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});
router.get("/delete-db-users", async (req, res) => {
  const users = await prisma.user.findMany();
  if (users.length === 0) {
    return res.send("No users to delete");
  }
  if (users) {
    await prisma.user.deleteMany({});
    return res.send("Users deleted");
  }
});

module.exports = router;
