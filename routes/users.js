const express = require("express");
const bcrypt = require("bcrypt");
const { prisma } = require("../db");
const router = express.Router();

const saltRounds = 10;
const saltRoundsRandom = bcrypt.genSaltSync(saltRounds);

router.get("/", async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

router.post("/", async (req, res) => {
  const requestBody = req.body;
  if (!requestBody) res.status(400).send("No body");
  try {
    const hashedPassword = bcrypt.hashSync(
      requestBody.password,
      saltRoundsRandom,
    );
    const newUser = await prisma.user.create({
      data: {
        name: requestBody.name,
        email: requestBody.email.toLowerCase(),
        password: hashedPassword,
      },
    });
    console.log("newUser", newUser);
    res.json(newUser);
  } catch (error) {
    console.error(error);
    if (error.code === "P2002") {
      console.error("Error", "Email already exists");
    }
    res.status(400).json({ message: "Error user already exists" });
  }
});

router.post("/login", async (req, res) => {
  const requestBody = req.body;
  console.log("emailrequest", requestBody.email);
  if (!requestBody) res.status(400).json({ message: "No request body" });
  try {
    const userFound = await prisma.user.findUnique({
      where: {
        email: requestBody.email,
      },
    });
    if (!userFound) {
      res.status(400).json({ message: "User not found" });
    }
    const isAuthenticated = bcrypt.compareSync(
      requestBody.password,
      userFound.password,
    );
    if (!isAuthenticated) {
      res.status(400).json({ message: "Incorrect email or password" });
    }
    res.send("User logged in");
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/delete-db-users", async (req, res) => {
  const users = await prisma.user.findMany();
  if (users.length === 0) {
    res.send("No users to delete");
  }
  if (users) {
    await prisma.user.deleteMany({});
    res.send("Users deleted");
  }
});

router
  .route("/:id")
  .get(async (req, res) => {
    const userFound = await prisma.user.findUnique({
      where: {
        id: parseInt(req.params.id),
      },
    });
    res.send(req.user.name);
  })
  .put((req, res) => {
    // update user with id
  })
  .delete((req, res) => {
    // delete user with id
  });

router.param("id", (req, res, next, id) => {
  req.user = users.find((user) => user.id === parseInt(id));
  next();
});

module.exports = router;
