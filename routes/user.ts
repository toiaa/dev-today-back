import { Router, Request, Response } from "express";
import { validateParams, validateQuery } from "../middlewares/middleware";
import { followSchema, idSchema, userPostsQuery } from "../lib/validations";
import { prisma } from "../lib/prisma";
import { StatusCodes } from "http-status-codes";
import { PostType } from "@prisma/client";
import { TypedRequest, TypedRequestParams } from "zod-express-middleware";
import { ZodAny } from "zod";

const router = Router();

//return all users with their profile from the database
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
  validateParams(idSchema),
  async (req: TypedRequestParams<typeof idSchema>, res: Response) => {
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
            take: 3, // Take only the latest three posts
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

//get all posts of a specific user, filter by postType, with pagination
router.get(
  "/:id/posts",
  validateParams(idSchema),
  validateQuery(userPostsQuery),
  async (
    req: TypedRequest<typeof idSchema, typeof userPostsQuery, ZodAny>,
    res: Response,
  ) => {
    const id = req.params.id;
    const type = req.query.postType;

    const page = req.query.page ? parseInt(req.query.page) : 1;
    const pageSize = 5; // Number of posts per page
    try {
      const skip = (page - 1) * pageSize;
      const userPosts = await prisma.post.findMany({
        where: {
          authorId: id,
          type: type as PostType,
        },
        skip: skip,
        take: pageSize,
      });

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
  validateParams(idSchema),
  validateQuery(followSchema),
  async (
    req: TypedRequest<typeof idSchema, typeof followSchema, ZodAny>,
    res: Response,
  ) => {
    const followerId = req.params.id;
    const followingId = req.query.followid;
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
  validateParams(idSchema),
  async (req: TypedRequestParams<typeof idSchema>, res: Response) => {
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
