import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";
import { validate } from "../middlewares/authMiddleware";
import { StatusCodes } from "http-status-codes";
import {
  userRegisterSchema,
  userLoginSchema,
  idParameterSchema,
} from "../zodSchemas/authSchemas";

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

router.post(
  "/login",
  validate(userLoginSchema),
  async (req: Request, res: Response) => {
    const requestBody = req.body;
    try {
      const userFound = await prisma.user.findUnique({
        where: {
          email: requestBody.email,
        },
      });
      if (!userFound) {
        return res.status(StatusCodes.BAD_REQUEST).json(userFound);
      }
      const isAuthenticated = await bcrypt.compareSync(
        requestBody.password,
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

router.post("/user", async (req: Request, res: Response) => {
  const requestBody = req.body;
  try {
    const userFound = await prisma.user.findUnique({
      where: {
        email: requestBody.email,
      },
      include: {
        profile: true,
      },
    });
    res.status(StatusCodes.OK).json(userFound);
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.OK).json({ message: "User not found" });
  }
});

router.get(
  "/:id",
  validate(idParameterSchema),
  async (req: Request, res: Response) => {
    const id = req.params.id;
    try {
      const userFound = await prisma.user.findUnique({
        where: {
          id,
        },
        include: {
          profile: true,
        },
      });
      res.status(StatusCodes.OK).json(userFound);
    } catch (error) {
      console.error(error);
      res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });
    }
  },
);

export default router;
