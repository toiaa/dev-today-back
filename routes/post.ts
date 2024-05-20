import { Router, Response } from "express";
import { prisma } from "../lib/prisma";
import { StatusCodes } from "http-status-codes";
import {
  idSchema,
  likeIdSchema,
  postSchema,
  updatePostSchema,
} from "../lib/validations";
import { validate, ValidationType } from "../middlewares/middleware";
import {
  TypedRequest,
  TypedRequestBody,
  TypedRequestParams,
} from "zod-express-middleware";
import { ZodAny } from "zod";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
const router = Router();

//get a specific post with the post's id.
router.get(
  "/:id",
  validate(idSchema, ValidationType.PARAMS),
  async (req: TypedRequestParams<typeof idSchema>, res: Response) => {
    const id = req.params.id;
    try {
      const posts = await prisma.post.findMany({
        where: {
          id,
        },
        include: {
          tags: true,
        },
      });
      if (posts.length === 0) {
        return res.status(StatusCodes.NOT_FOUND).send("No posts found");
      } else {
        return res.status(StatusCodes.OK).json(posts);
      }
    } catch (error) {
      console.error(error);
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }
  },
);

//create a post
router.post(
  "/",
  validate(postSchema, ValidationType.BODY),
  async (req: TypedRequestBody<typeof postSchema>, res: Response) => {
    const { title, content, type, authorId, groupId, tags } = req.body;

    try {
      const existingTagId: ({ id: string; name: string } | null)[] = [];
      const getTagIds = await tags.map(async (tag) => {
        const existingTag = await prisma.tag.findUnique({
          where: {
            name: tag,
          },
        });

        if (existingTag !== null) {
          existingTagId.push(existingTag);
        } else {
          const createdTag = await prisma.tag.create({
            data: {
              name: tag,
            },
          });
          existingTagId.push(createdTag);
          console.log("1stexistingTagId", existingTagId);
        }
        return existingTagId;
      });

      const creatPost = await prisma.post.create({
        data: {
          title,
          content,
          type,
          authorId,
          groupId,
          // tags: {
          //   connect: getTagIds.map((tag) => ({ id: tag?.id })),
          // },
        },
        include: {
          tags: true,
        },
      });
      return res.status(StatusCodes.OK).json(creatPost);
    } catch (error) {
      console.error(error);
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }
  },
);

//edit a post with its id
router.patch(
  "/:id",
  validate(idSchema, ValidationType.PARAMS),
  validate(updatePostSchema, ValidationType.BODY),
  async (
    req: TypedRequest<typeof idSchema, ZodAny, typeof updatePostSchema>,
    res: Response,
  ) => {
    const id = req.params.id;
    const { title, content } = req.body;
    try {
      const posts = await prisma.post.update({
        where: {
          id,
        },
        data: {
          title,
          content,
        },
      });
      return res.status(StatusCodes.OK).json(posts);
    } catch (error) {
      console.error(error);
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }
  },
);

// like a post of another user
router.post(
  "/:id/like",
  validate(idSchema, ValidationType.PARAMS),
  async (
    req: TypedRequest<typeof idSchema, ZodAny, typeof likeIdSchema>,
    res: Response,
  ) => {
    const likedPostId = req.params.id;
    const likerId = req.body.likerId;
    try {
      await prisma.post.update({
        where: {
          id: likedPostId,
        },
        data: {
          likes: {
            create: {
              userId: likerId,
            },
          },
        },
      });
      return res
        .status(StatusCodes.OK)
        .json({ message: "You now like this post" });
    } catch (error) {
      console.error(error);
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          return res
            .status(StatusCodes.CONFLICT)
            .json({ message: "You can't like a post twice" });
        }
      }
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }
  },
);

//unlike a post of another user
router.post(
  "/:id/unlike",
  validate(idSchema, ValidationType.PARAMS),
  async (
    req: TypedRequest<typeof idSchema, ZodAny, typeof likeIdSchema>,
    res: Response,
  ) => {
    const likedPostId = req.params.id;
    const likerId = req.body.likerId;
    try {
      await prisma.like.delete({
        where: {
          userId_postId: {
            userId: likerId,
            postId: likedPostId,
          },
        },
      });
      return res.status(StatusCodes.OK).json({ message: "Unliked this post" });
    } catch (error) {
      console.error(error);
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }
  },
);

//delete a single post
router.delete(
  "/:id",
  validate(idSchema, ValidationType.PARAMS),
  async (req: TypedRequestParams<typeof idSchema>, res: Response) => {
    const id = req.params.id;
    try {
      await prisma.post.delete({
        where: {
          id,
        },
      });

      return res.status(StatusCodes.OK).json({ message: "Post deleted" });
    } catch (error) {
      console.error(error);
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }
  },
);

export default router;
