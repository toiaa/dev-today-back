import { Router, Response } from "express";
import { prisma } from "../lib/prisma";
import { StatusCodes } from "http-status-codes";
import { idSchema, postSchema, updatePostSchema } from "../lib/validations";
import { validateBody, validateParams } from "../middlewares/middleware";
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
  validateParams(idSchema),
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
  validateBody(postSchema),
  async (req: TypedRequestBody<typeof postSchema>, res: Response) => {
    const { title, content, authorId } = req.body;
    try {
      const post = await prisma.post.create({
        data: {
          title,
          content,
          authorId,
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
  validateParams(idSchema),
  validateBody(updatePostSchema),
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
  validateParams(idSchema),
  async (req: TypedRequestParams<typeof idSchema>, res: Response) => {
    const id = req.params.id;
    try {
      const deletedPost = await prisma.post.delete({
        where: {
          id,
        },
      });

      return res.status(StatusCodes.OK).json(deletedPost);
    } catch (error) {
      console.error(error);
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }
  },
);

export default router;
