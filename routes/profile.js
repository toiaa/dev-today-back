const express = require("express");
const { prisma } = require("../db");
const router = express.Router();

router.get("/onboarding", async (req, res) => {
  const requestBody = req.body;
  if (!requestBody) return res.status(400).send("No body");
  try {
    const { journey, ambitions, technologies, id } = requestBody;
    if (!journey || !ambitions || !technologies || !id)
      return res.status(400).send("Missing fields");
    const updatedUser = await prisma.profile.upsert({
      where: {
        userId: id,
      },
      create: {
        journey,
        ambitions,
        technologies,
      },
      update: {
        onBoardingDone: true,
      },
    });
    return res.status(201).json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/boarded", async (req, res) => {
  const requestBody = req.body;
  if (!requestBody) return res.status(400).send("No body");
  try {
    const { id } = requestBody;
    const user = await prisma.profile.findUnique({
      where: {
        userId: id,
      },
    });
    return res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
