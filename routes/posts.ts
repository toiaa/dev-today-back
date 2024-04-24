import { Router, Request, Response } from "express";
const { prisma } = require("../db");
const { StatusCodes } = require("http-status-codes");
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
router.post("/", async (req: Request, res: Response) => {
  const requestBody = req.body;
  if (!requestBody)
    return res.status(StatusCodes.BAD_REQUEST).send("No request body");
  const { title, content, authorid, tags, id } = requestBody;
  if (!id) return res.status(StatusCodes.BAD_REQUEST).send("No post id");
  try {
    const posts = await prisma.post.create({
      data: {
        title,
        content,
        authorid,
        tags,
      },
    });

    return res.status(StatusCodes.OK).json(posts);
  } catch (error) {
    console.error(error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error" });
  }
});

router.patch("/:id", async (req: Request, res: Response) => {
  const id = req.params.id;
  if (!id)
    return res.status(StatusCodes.BAD_REQUEST).send("No post id provided");
  const requestBody = req.body;
  if (!requestBody) return res.status(StatusCodes.BAD_REQUEST).send("No body");
  const { title, content, tags } = requestBody;
  try {
    const posts = await prisma.post.update({
      where: {
        id,
      },
      data: {
        title,
        content,
        tags,
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

router.delete("/:id", async (req: Request, res: Response) => {
  const id = req.params.id;
  if (!id)
    return res.status(StatusCodes.BAD_REQUEST).send("No post id provided ");
  try {
    const posts = await prisma.post.delete({
      where: {
        id,
      },
    });

    return res.status(StatusCodes.OK).json(posts);
  } catch (error) {
    console.error(error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error" });
  }
});

router.get("/user/:id", async (req: Request, res: Response) => {
  const id = req.params.id;
  if (!id) return res.status(StatusCodes.BAD_REQUEST).send("No user id");
  try {
    const posts = await prisma.post.findMany({
      where: {
        authorid: id,
      },
      include: {
        tags: true,
      },
    });
    if (posts.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).send("Not Found");
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

module.exports = router;
