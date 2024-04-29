import { Router, Request, Response } from "express";

import { prisma } from "../db";
import { StatusCodes } from "http-status-codes";
import { validate } from "../middlewares/authMiddleware";
import { idParameterSchema, onBoardingSchema } from "../zodSchemas/authSchemas";

const router = Router();

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

router.get(
  "/onboarding/:id",
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

router.put(
  "/onboarding/:id",
  validate(idParameterSchema),
  async (req: Request, res: Response) => {
    const id = req.params.id;
    const requestBody = req.body;
    try {
      const { journey, ambitions, tech } = requestBody;
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

export = router;
