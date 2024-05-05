import { Router, Request, Response } from "express";

import { prisma } from "../lib/prisma";
import { StatusCodes } from "http-status-codes";
import { validate } from "../middlewares/authMiddleware";
import { onBoardingSchema } from "../zodSchemas/authSchemas";
import { idParameterSchema } from "../zodSchemas/postSchemas";

const router = Router();

//update user with onboarding information
router.post(
  "/onboarding",
  validate(onBoardingSchema),
  async (req: Request, res: Response) => {
    try {
      const { journey, ambitions, tech, id } = req.body;
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

//edit onboarding information on a user profile
router.patch(
  "/onboarding/:id",
  validate(idParameterSchema),
  async (req: Request, res: Response) => {
    const id = req.params.id;
    try {
      const { journey, ambitions, tech } = req.body;
      if (!journey || !ambitions || !tech)
        return res.status(StatusCodes.BAD_REQUEST).send("Missing fields");
      const modifyUserOnboarding = await prisma.profile.update({
        where: {
          userId: id,
        },
        data: {
          journey,
          ambitions,
          tech,
        },
      });

      return res.status(StatusCodes.OK).json(modifyUserOnboarding);
    } catch (error) {
      console.error(error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }
  },
);

//return user profile including onboarding data:journey/ambitons/tech
router.get(
  "/:id",
  validate(idParameterSchema),
  async (req: Request, res: Response) => {
    const id = req.params.id;
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
  },
);

export default router;
