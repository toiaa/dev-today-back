const express = require("express");
const { prisma } = require("../db");
const router = express.Router();

router.post("/onboarding", async (req, res) => {
  const requestBody = req.body;
  if (!requestBody) return res.status(400).send("No body");
  try {
    const { journey, ambitions, tech, id } = requestBody.data;
    console.log(requestBody.data);
    if (!id || !journey || !ambitions || !tech)
      return res.status(400).send("Missing fields");
    /*  const updatedUser = await prisma.profile.upsert({
      where: {
        userId: id,
      },
      journey: {
        create: {
          name: journey.name,
        },
      },
      ambitions: {
        create: ambitions,
      },
      tech: {
        create: tech,
      },
      update: {
        onBoardingDone: true,
      },
      include: {
        journey: true,
        ambitions: true,
        tech: true,
      },
    });
    return res.status(201).json(updatedUser); */
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/onboarding/:id", async (req, res) => {
  const id = req.params.id;
  if (!id) return res.status(400).send("No user id");
  try {
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
