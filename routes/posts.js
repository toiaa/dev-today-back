// code for individual routes for posts
const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.send("get posts");
});

/// checking

module.exports = router;
