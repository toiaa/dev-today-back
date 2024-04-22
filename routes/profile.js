const express = require("express");
const { prisma } = require("../db");
const router = express.Router();

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

router.get("/profile", async (req, res) => {
  const requestBody = req.body;
  if (!requestBody) return res.status(400).send("No body");
  try {
    const { id } = requestBody;
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
      include: {
        profile: true,
      },
    });
    return res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});
