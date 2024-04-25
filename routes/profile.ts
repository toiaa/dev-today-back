import { Router, Request, Response } from "express";

const { prisma } = require("../db");
const { StatusCodes } = require("http-status-codes");
const router = Router();
const { validate } = require("../middlewares/authMiddleware.ts");
const { onBoardingSchema } = require("../zodSchemas/authSchemas");

router.post(
  "/onboarding",
  validate(onBoardingSchema),
  async (req: Request, res: Response) => {
    const requestBody = req.body;
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
  },
);

router.get("/onboarding/:id", async (req: Request, res: Response) => {
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