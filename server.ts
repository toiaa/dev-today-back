const express = require("express");
const app = express();
const port = 3000;

app.use(
  logger,
); /* here the logger middleware will execute for all the routes at the beginning. this depends on the order of the middlewares , because everiting in the server runs in order */
app.get("/", (req, res) => {
  res.send("api '/', express running");
});

const usersRouter = require("./routes/users");
const postsRouter = require("./routes/posts");

// anything that starts with users will be redirected to the usersRouter, to all the routes in the users.js file
app.use("/users", usersRouter);
app.use("/posts", postsRouter);

function logger(req, res, next) {
  console.log(req.originalUrl, req.method);
  next();
}
/* 
app.get("/", HERE CAN GO A MIDDLEWARE ONLY FOR THIS ROUTE,(req, res) => {
  res.send("api '/', express running");
});
*/

app.listen(port);
