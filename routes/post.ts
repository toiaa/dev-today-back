import { Router, Response } from "express";
import { prisma } from "../lib/prisma";
import { StatusCodes } from "http-status-codes";
import { idSchema, postSchema, updatePostSchema } from "../lib/validations";
import { validate, ValidationType } from "../middlewares/middleware";
import {
  TypedRequest,
  TypedRequestBody,
  TypedRequestParams,
} from "zod-express-middleware";
import { ZodAny } from "zod";
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
    const { title, content, type, authorId, groupId } = req.body;
    try {
      const post = await prisma.post.create({
        data: {
          title,
          content,
          type,
          authorId,
          groupId,
        },
      });

      return res.status(StatusCodes.OK).json(post);
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
