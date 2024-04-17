const express = require("express");
const router = express.Router();
// all /users routes will be redirected to this file
const users = [
  { id: 1, name: "John" },
  { id: 2, name: "Jane" },
  { id: 3, name: "Jack" },
  { id: 4, name: "Jill" },
  { id: 5, name: "Joe" },
  { id: 6, name: "Jenny" },
];

// the router object has the same methods as the app object
router.get("/", (req, res) => {
  res.send("get users");
});
// i delete the '/users' from the first parameter of the get function and leave the '/' because the app.use('/users', usersRouter); in server.js

router.post("/", (req, res) => {
  res.send("create user");
});

// dynamic route parameter
router
  .route("/:id") // for defining our rounte only once to clean up the code, with different req types
  .get((req, res) => {
    res.send(req.user.name);
  })
  .put((req, res) => {
    res.send(`updating user with id: ${req.params.id}`);
  })
  .delete((req, res) => {
    res.send(`deleting user with id: ${req.params.id}`);
  });

//param is a middleware, if you dont execute next() the request will hang and not go to the next middleware
router.param("id", (req, res, next, id) => {
  req.user = users.find((user) => user.id === parseInt(id));
  next();
});

module.exports = router;
