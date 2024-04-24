const express = require("express");
const { prisma } = require("../db");
const { StatusCodes } = require("http-status-codes");
const router = express.Router();

router.post("/onboarding", async (req, res) => {
  const requestBody = req.body;
  if (!requestBody) return res.status(StatusCodes.BAD_REQUEST).send("No body");
  try {
    const { journey, ambitions, tech, id } = requestBody;
    if (!id || !journey || !ambitions || !tech)
      return res.status(StatusCodes.BAD_REQUEST).send("Missing fields");
    const updatedProfile = await prisma.profile.update({
      where: {
        userId: id,
      },
      data: {
        onBoardingCompleted: true,
        journey,
        ambitions,
        tech,
      },
    });
    return res.status(StatusCodes.CREATED).json(updatedProfile);
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error" });
  }
});

router.get("/onboarding/:id", async (req, res) => {
  const id = req.params.id;
  if (!id) return res.status(StatusCodes.BAD_REQUEST).send("No user id");
  try {
    const user = await prisma.profile.findUnique({
      where: {
        userId: id,
      },
    });
    return res.status(StatusCodes.OK).json(user);
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error" });
  }
});

module.exports = router;
