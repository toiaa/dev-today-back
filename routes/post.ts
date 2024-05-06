import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { StatusCodes } from "http-status-codes";
import {
  idParameterSchema,
  postSchema,
  updatePostSchema,
} from "../zodSchemas/postSchemas";
import { validate } from "../middlewares/authMiddleware";
const router = Router();

//get a specific post with the post's id.
router.get(
  "/:id",
  validate(idParameterSchema),
  async (req: Request, res: Response) => {
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
router.post("/", validate(postSchema), async (req: Request, res: Response) => {
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
});

//edit a post with its id
router.patch(
  "/:id",
  validate(idParameterSchema),
  validate(updatePostSchema),
  async (req: Request, res: Response) => {
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
  validate(idParameterSchema),
  async (req: Request, res: Response) => {
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
