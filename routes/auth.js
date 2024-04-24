const express = require("express");
const bcrypt = require("bcrypt");
const { prisma } = require("../db");
const router = express.Router();
const { validate } = require("../middlewares/authMiddleware.ts");
const { StatusCodes } = require("http-status-codes");
const saltRounds = 10;
const saltRoundsRandom = bcrypt.genSaltSync(saltRounds);
const {
  userRegisterchema,
  userLoginSchema,
} = require("../zodSchemas/authSchemas");

router.post("/register", validate(userRegisterchema), async (req, res) => {
  const requestBody = req.body;
  if (!requestBody) return res.status(StatusCodes.BAD_REQUEST).send("No body");

  try {
    const hashedPassword = bcrypt.hashSync(
      requestBody.password,
      saltRoundsRandom,
    );
    const newUser = await prisma.user.create({
      data: {
        username: requestBody.username,
        email: requestBody.email.toLowerCase(),
        password: hashedPassword,
        profile: {
          create: {
            onBoardingCompleted: false,
          },
        },
      },
    });
    console.log("newUser", newUser);
    res.status(StatusCodes.CREATED).json(newUser);
  } catch (error) {
    console.error(error);
    if (error.code === "P2002") {
      console.error("Error", "Email already exists");
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Error user already exists" });
    }
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error" });
  }
});

router.post("/login", validate(userLoginSchema), async (req, res) => {
  const requestBody = req.body;
  console.log("emailrequest", requestBody.email);
  if (!requestBody)
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "No request body" });
  try {
    const userFound = await prisma.user.findUnique({
      where: {
        email: requestBody.email,
      },
    });
    if (!userFound) {
      return res.status(StatusCodes.BAD_REQUEST).json(userFound);
    }
    const isAuthenticated = bcrypt.compareSync(
      requestBody.password,
      userFound.password,
    );
    if (!isAuthenticated) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Incorrect email or password" });
    }
    res.status(200).json(userFound);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/user", async (req, res) => {
  const requestBody = req.body;
  if (!requestBody) return res.status(StatusCodes.BAD_REQUEST).send("No body");
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

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  if (!id) return res.status(StatusCodes.BAD_REQUEST).send("No user id");
  try {
    const userFound = await prisma.user.findUnique({
      where: {
        id,
      },
      include: {
        profile: true,
      },
    });
    res.status(200).json(userFound);
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.OK).json({ message: "User not found" });
  }
});

module.exports = router;
