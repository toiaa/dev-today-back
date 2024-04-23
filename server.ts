const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const port = 3005;

const corsOptions = {
  origin: "http://127.0.0.1:3005",
};

app.use(cors(corsOptions));
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
const profileRouter = require("./routes/profile");

app.use("/auth", authRouter);
app.use("/users", usersRouter);
app.use("/profile", profileRouter);
app.use("/posts", postsRouter);
app.listen(port);
