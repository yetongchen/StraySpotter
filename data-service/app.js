import express from "express";
import exphbs from "express-handlebars";
import methodOverride from "method-override";
import configRoutes from './routes/index.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.engine("handlebars", exphbs.engine({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Server log
app.use(async (req, res, next) => {
  const timeStamp = new Date().toUTCString();
  const method = req.method;
  const reqRoute = req.originalUrl;

  console.log(
    "[",
    timeStamp,
    "]",
    ":",
    method,
    reqRoute,
  );

  next();
});

app.use(methodOverride("_method"));

configRoutes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log("Your routes will be running on http://localhost:3000");
});
