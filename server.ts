const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = 3005;

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: false }));

function logger(req: any, res: any, next: any) {
  console.log(req.originalUrl, req.method);
  next();
}

app.use(logger);
app.get("/", (req: any, res: any) => {
  res.send("api '/', express running");
});

const authRouter = require("./routes/auth");
const usersRouter = require("./routes/users");
const postsRouter = require("./routes/posts");

app.use("/auth", authRouter);
app.use("/users", usersRouter);
app.use("/posts", postsRouter);
app.listen(port);
