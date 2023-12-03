import express from "express";
import exphbs from "express-handlebars";
import methodOverride from "method-override";
import configRoutes from './routes/index.js';
import cors from "cors";

const app = express();

app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// app.engine("handlebars", exphbs.engine({ defaultLayout: "main" }));
// app.set("view engine", "handlebars");

app.use(
  cors({
    origin: "http://localhost:3000", // 这里需要替换为您的前端应用的 URL
    credentials: true, // 允许跨域请求设置 cookie
  })
);

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

// app.use(methodOverride("_method"));

configRoutes(app);

app.listen(4000, () => {
  console.log("We've now got a server!");
  console.log("Your routes will be running on http://localhost:4000");
});
