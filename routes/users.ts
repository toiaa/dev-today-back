import { Router, Request, Response } from "express";
import { validate } from "../middlewares/authMiddleware";
import { idParameterSchema } from "../zodSchemas/authSchemas";
import { prisma } from "../db";
import { StatusCodes } from "http-status-codes";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        profile: true,
      },
    });
    return res.json(users);
  } catch (error) {
    console.error(error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error" });
  }
});

router.get("/delete-db-users", async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany();
    if (users.length === 0) {
      return res.send("No users to delete");
    }
    if (users) {
      await prisma.user.deleteMany({});
      return res.send("Users deleted");
    }
  } catch (error) {
    console.error(error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error" });
  }
});

router.delete(
  "/:id",
  validate(idParameterSchema),
  async (req: Request, res: Response) => {
    const id = req.params.id;
    try {
      const user = await prisma.user.delete({
        where: {
          id,
        },
      });

      if (user) {
        res.status(StatusCodes.OK).json({
          msg: "User deleted",
        });
      } else {
        res
          .status(StatusCodes.BAD_REQUEST)
          .json({ msg: `No member with id of ${req.params.id}` });
      }
    } catch (error) {
      console.error(error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }
  },
);

export = router;
