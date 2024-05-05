import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { StatusCodes } from "http-status-codes";
import { idParameterSchema } from "../zodSchemas/authSchemas";
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
router.post("/", async (req: Request, res: Response) => {
  const { title, content, authorId } = req.body;
  if (!authorId) return res.status(StatusCodes.BAD_REQUEST).send("No user id");
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

// router.patch("/:id", async (req: Request, res: Response) => {
//   const id = req.params.id;
//   if (!id)
//     return res.status(StatusCodes.BAD_REQUEST).send("No post id provided");
//   const requestBody = req.body;
//   const { title, content, tags } = requestBody;
//   try {
//     const posts = await prisma.post.update({
//       where: {
//         id,
//       },
//       data: {
//         title,
//         content,
//         tags,
//       },
//     });
//     if (posts.length === 0) return res.status(StatusCodes.OK).json(posts);
//   } catch (error) {
//     console.error(error);
//     return res
//       .status(StatusCodes.INTERNAL_SERVER_ERROR)
//       .json({ message: "Internal server error" });
//   }
// });

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

// router.get(
//   "api/user/:userId/post/",
//   validate(idParameterSchema),
//   async (req: Request, res: Response) => {
//     const userId = req.params.id;
//     try {
//       const postsFound = await prisma.post.findMany({
//         where: {
//           authorId: userId,
//         },
//         include: {
//           tags: true,
//         },
//       });

//       if (postsFound.length === 0) {
//         return res.status(StatusCodes.NOT_FOUND).json(postsFound);
//       } else {
//         return res.status(StatusCodes.OK).json(postsFound);
//       }
//     } catch (error) {
//       console.error(error);
//       return res
//         .status(StatusCodes.INTERNAL_SERVER_ERROR)
//         .json({ message: "Internal server error" });
//     }
//   },
// );

export default router;
