import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";
import { validate } from "../middlewares/authMiddleware";
import { StatusCodes } from "http-status-codes";
import { userRegisterSchema, userLoginSchema } from "../zodSchemas/authSchemas";

const router = Router();
const saltRounds = 10;
const saltRoundsRandom = bcrypt.genSaltSync(saltRounds);

//register a new user
router.post(
  "/register",
  validate(userRegisterSchema),
  async (req: Request, res: Response) => {
    try {
      const hashedPassword = bcrypt.hashSync(
        req.body.password,
        saltRoundsRandom,
      );
      const newUser = await prisma.user.create({
        data: {
          username: req.body.username,
          email: req.body.email.toLowerCase(),
          password: hashedPassword,
          profile: {
            create: {
              onBoardingCompleted: false,
            },
          },
        },
      });
      res.status(StatusCodes.CREATED).json(newUser);
    } catch (error: any) {
      console.error(error);
      if (error.code === "P2002") {
        console.error("Error", "Email already exists");
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "Error user already exists" });
      }
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }
  },
);

//login with email address and password
router.post(
  "/login",
  validate(userLoginSchema),
  async (req: Request, res: Response) => {
    try {
      const userFound = await prisma.user.findUnique({
        where: {
          email: req.body.email,
        },
      });
      if (!userFound) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "No user found" });
      }
      const isAuthenticated = await bcrypt.compareSync(
        req.body.password,
        userFound.password,
      );
      if (!isAuthenticated) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "Incorrect email or password" });
      }
      res.status(StatusCodes.OK).json(userFound);
    } catch (error) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }
  },
);

export default router;
