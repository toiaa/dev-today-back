import { Router, Request, Response } from "express";
import { validate, ValidationType } from "../middlewares/middleware";
import {
  viewerIdSchema,
  idSchema,
  userGroupQuery,
  userPostsQuery,
  followViewerIdSchema,
} from "../lib/validations";
import { prisma } from "../lib/prisma";
import { StatusCodes } from "http-status-codes";
import { PostType } from "@prisma/client";
import { TypedRequest, TypedRequestParams } from "zod-express-middleware";
import { ZodAny } from "zod";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

const router = Router();

//return all users with their profile from the database
router.get("/", async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      omit: {
        password: true,
      },
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

//return individual user with profile, following & followers count, whether user whose profile is being viewed is follwed by person loged in, and newest three posts
router.get(
  "/:id",
  validate(idSchema, ValidationType.PARAMS),
  validate(viewerIdSchema, ValidationType.QUERY),
  async (
    req: TypedRequest<typeof idSchema, typeof viewerIdSchema, ZodAny>,
    res: Response,
  ) => {
    const id = req.params.id;
    const checkFollowingId = req.query.viewerId;

    try {
      const user = await prisma.user.findUnique({
        where: {
          id,
        },
        omit: {
          password: true,
        },
        include: {
          profile: true,
          posts: {
            orderBy: {
              createdAt: "desc", // Order posts by createdAt in descending order
            },
            take: 3, // Take only the latest three posts
          },
          _count: {
            select: { followers: true, following: true },
          },
          followers: {
            where: {
              followerId: checkFollowingId,
            },
          },
        },
      });

      const followerArray = user?.followers;

      const userIsFollowed = followerArray?.some(
        (item) => item.followerId === checkFollowingId,
      );

      const userCopy = { ...user, userIsFollowed };
      delete userCopy?.followers;

      if (!user) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .send("No user with that ID found");
      }

      return res.status(StatusCodes.OK).json(userCopy);
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
  validate(idSchema, ValidationType.PARAMS),
  validate(userPostsQuery, ValidationType.QUERY),
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
        include: {
          tags: {
            select: {
              name: true,
            },
          },
          likes: true,
          comments: true,
        },
        skip: skip,
        take: pageSize,
      });

      if (!userPosts.length) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .send("No posts for user found");
      }

      return res.status(StatusCodes.OK).json(userPosts);
    } catch (error) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }
  },
);

// get all groups a specific user is a part of and the first 4 users with their user image.
router.get(
  "/:id/groups",
  validate(idSchema, ValidationType.PARAMS),
  validate(userGroupQuery, ValidationType.QUERY),
  async (
    req: TypedRequest<typeof idSchema, typeof userGroupQuery, ZodAny>,
    res: Response,
  ) => {
    const id = req.params.id;

    const page = req.query.page ? parseInt(req.query.page) : 1;
    const pageSize = 5; // Number of posts per page
    try {
      const skip = (page - 1) * pageSize;
      const userGroups = await prisma.group.findMany({
        where: {
          groupUser: {
            some: {
              userId: id,
            },
          },
        },
        select: {
          name: true,
          coverImage: true,
          bio: true,
          groupUser: {
            take: 4,
            include: {
              user: {
                select: {
                  image: true,
                },
              },
            },
          },
          _count: {
            select: { groupUser: true },
          },
        },
        skip,
        take: pageSize,
      });

      if (!userGroups.length) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .send("No groups for user found");
      }

      return res.status(StatusCodes.OK).json(userGroups);
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
  validate(idSchema, ValidationType.PARAMS),
  validate(followViewerIdSchema, ValidationType.QUERY),
  async (
    req: TypedRequest<typeof idSchema, typeof followViewerIdSchema, ZodAny>,
    res: Response,
  ) => {
    const followerId = req.params.id;
    const followingId = req.query.viewerId;
    try {
      // Check if the user is trying to follow themselves
      if (followerId === followingId) {
        return res
          .status(StatusCodes.CONFLICT)
          .json({ message: "You cannot follow yourself" });
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
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          return res
            .status(StatusCodes.NOT_FOUND)
            .json({ message: "One or more Ids do not exist" });
        }
        if (error.code === "P2002") {
          return res
            .status(StatusCodes.NOT_FOUND)
            .json({ message: "You are already following this user" });
        }
      }
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }
  },
);

//delete a specific user
router.delete(
  "/:id",
  validate(idSchema, ValidationType.PARAMS),
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
      }
    } catch (error) {
      console.error(error);
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          return res
            .status(StatusCodes.NOT_FOUND)
            .json({ message: "User with this ID does not exist" });
        }
      }
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }
  },
);

export default router;
