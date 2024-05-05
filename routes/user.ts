import { Router, Request, Response } from "express";
import { validate } from "../middlewares/authMiddleware";
import { queryParamsSchema } from "../zodSchemas/authSchemas";
import { idParameterSchema } from "../zodSchemas/postSchemas";
import { prisma } from "../lib/prisma";
import { StatusCodes } from "http-status-codes";
import { PostType } from "../types";

const router = Router();

//return all users in the database
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

//return individual user with profile/following/followers and latest single post in each post type.
router.get(
  "/:id",
  validate(idParameterSchema),
  async (req: Request, res: Response) => {
    const id = req.params.id;
    try {
      const user = await prisma.user.findUnique({
        where: {
          id,
        },
        include: {
          profile: true,
          following: true,
          followers: true,
          posts: {
            orderBy: {
              createdAt: "desc", // Order posts by createdAt in descending order
            },
            distinct: ["type"], // Return only one post per category
            take: 3, // Take only the latest post for each category
          },
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

//get posts of a specific user by postType and pagination
router.get(
  "/:id/posts",
  validate(idParameterSchema),
  validate(queryParamsSchema),
  async (req: Request, res: Response) => {
    const id = req.params.id;
    const type =
      typeof req.query.postType === "string"
        ? req.query.postType.toUpperCase()
        : undefined;

    const page = parseInt(req.query.page as string) || 1;
    const pageSize = 5; // Number of posts per page
    try {
      let userPosts;
      const skip = (page - 1) * pageSize;

      // Check if type is provided in the query parameters
      if (type) {
        userPosts = await prisma.post.findMany({
          where: {
            authorId: id,
            type: type as PostType,
          },
          skip: skip,
          take: pageSize,
        });
      } else {
        // If type is not provided, fetch all posts for the user
        userPosts = await prisma.post.findMany({
          where: {
            authorId: id,
          },
          skip: skip,
          take: pageSize,
        });
      }
      return res.status(StatusCodes.OK).json(userPosts);
    } catch (error) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }
  },
);

//follow a user
router.post(
  "/:id/follow",
  validate(idParameterSchema),
  async (req: Request, res: Response) => {
    const followerId = req.params.id;
    const followingId = req.query.followid as string;
    try {
      // Check if the user is trying to follow themselves
      if (followerId === followingId) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "You cannot follow yourself" });
      }

      // Check if the follow relation already exists
      const existingFollow = await prisma.follow.findFirst({
        where: {
          followerId,
          followingId,
        },
      });

      if (existingFollow) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "You are already following this user" });
      }

      // Create a new follow relation
      const newFollow = await prisma.follow.create({
        data: {
          follower: { connect: { id: followerId } },
          following: { connect: { id: followingId } },
        },
      });

      return res.status(StatusCodes.OK).json(newFollow);
    } catch (error) {
      console.error(error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }
  },
);

//delete a specific user
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

// delete all users in the database
router.delete("/delete-db-users", async (req: Request, res: Response) => {
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

export default router;
