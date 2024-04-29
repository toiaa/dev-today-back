import { Router, Request, Response } from "express";
import { prisma } from "../db";
import { StatusCodes } from "http-status-codes";
const router = Router();

router.get("/:id", async (req: Request, res: Response) => {
  const id = req.params.id;
  if (!id)
    return res.status(StatusCodes.BAD_REQUEST).send("No post id provided");
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
      return res.status(404).send("No posts found");
    } else {
      return res.status(StatusCodes.OK).json(posts);
    }
  } catch (error) {
    console.error(error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error" });
  }
});

// router.post("/", async (req: Request, res: Response) => {
//   const requestBody = req.body;
//   const { title, content, authorid, tags } = requestBody;
//   if (!authorid) return res.status(StatusCodes.BAD_REQUEST).send("No user id");
//   try {
//     const posts = await prisma.post.create({
//       data: {
//         title,
//         content,
//         authorId,
//         tags,
//       },
//     });

//     return res.status(StatusCodes.OK).json(posts);
//   } catch (error) {
//     console.error(error);
//     return res
//       .status(StatusCodes.INTERNAL_SERVER_ERROR)
//       .json({ message: "Internal server error" });
//   }
// });

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

router.delete("/:id", async (req: Request, res: Response) => {
  const id = req.params.id;
  if (!id)
    return res.status(StatusCodes.BAD_REQUEST).send("No post id provided ");
  try {
    const postFound = await prisma.post.delete({
      where: {
        id,
      },
    });

    return res.status(StatusCodes.OK).json(postFound);
  } catch (error) {
    console.error(error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error" });
  }
});

router.get("api/user/:userId/post/", async (req: Request, res: Response) => {
  const userId = req.params.id;
  if (!userId) return res.status(StatusCodes.BAD_REQUEST).send("No user id");
  try {
    const postsFound = await prisma.post.findMany({
      where: {
        authorId: userId,
      },
      include: {
        tags: true,
      },
    });

    if (postsFound.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json(postsFound);
    } else {
      return res.status(StatusCodes.OK).json(postsFound);
    }
  } catch (error) {
    console.error(error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error" });
  }
});

export = router;
