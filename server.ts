const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = 3000;

/* Middlewares */
// to parse JSON bodies
app.use(bodyParser.json());
// to parse URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: false }));
// to console.log in the terminal the route and http method of the request
function logger(req: any, res: any, next: any) {
  console.log(req.originalUrl, req.method);
  next();
}
app.use(logger);

/* Routes */
app.get("/", (req: any, res: any) => {
  res.send("api '/', express running");
});
/* Routers */
const usersRouter = require("./routes/users");
const postsRouter = require("./routes/posts");

app.use("/users", usersRouter);
app.use("/posts", postsRouter);
app.listen(port);
