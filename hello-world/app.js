const serverless = require("serverless-http");
const express = require("express");
const statusRoutes = require("app/status");
const app = express();

console.log("TEST: ^" + process.env.TEST + "$");

app.get("/", (req, res, next) => {
  return res.status(200).json({
    message: "Hello from root!",
  });
});

app.use(statusRoutes);

app.get("/hello", (req, res, next) => {
  return res.status(200).json({
    message: "Hello from path, man! TEST: ^" + process.env.TEST + "$",
  });
});

app.get("/test", (req, res, next) => {
  return res.status(200).json({
    message: "test",
  });
});

app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found from app.js " + req.url,
  });
});

module.exports.core = app;
module.exports.lambdaHandler = serverless(app);
