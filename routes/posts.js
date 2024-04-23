// code for individual routes for posts
const express = require("express");
const router = express.Router();

router.get("/profile/posts", async (req, res) => {
  const requestBody = req.body;
  if (!requestBody) return res.status(400).send("No request body");
  try {
    const { userId } = requestBody;
    const posts = await prisma.post.findMany({
      where: {
        authorid: userId,
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
