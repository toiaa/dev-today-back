// code for individual routes for posts
const express = require("express");
const router = express.Router();

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  if (!id) return res.status(400).send("No post id");
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
      return res.status(200).json(posts);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/profile/:id", async (req, res) => {
  const id = req.params.id;
  if (!id) return res.status(400).send("No profile id");
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
      return res.status(404).send("No posts found");
    } else {
      return res.status(200).json(posts);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
