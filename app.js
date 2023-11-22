import express from "express";
import exphbs from "express-handlebars";
const app = express();
const configRoutes = require("./routes");

import configRoutes from "./routes/index.js";
const exphbs = require("express-handlebars");
const methodOverride = require("method-override");
var bodyParser = require("body-parser");


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.engine("handlebars", exphbs.engine({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Server log
app.use(async (req, res, next) => {
  const timeStamp = new Date().toUTCString();
  const method = req.method;
  const reqRoute = req.originalUrl;
  const userAuthState = req.session.user ? true : false;

  console.log(
    "[",
    timeStamp,
    "]",
    ":",
    method,
    reqRoute,
    "userAuthState: ",
    userAuthState
  );

  next();
});

app.use(methodOverride("_method"));

configRoutes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log("Your routes will be running on http://localhost:3000");
});
