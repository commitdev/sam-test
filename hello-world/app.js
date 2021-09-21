const serverless = require("serverless-http");
const express = require("express");
const statusRoutes = require("app/status");
const app = express();

lambdaAuthorizerMiddleware = (req, res, next) => {
  // comes from authrozier's Context
  const { id, email, name } = req.requestContext?.authorizer?.lambda || {};
  if (id && email) {
    req.user = {id, email, name}
  }
  next();
};

app.use(lambdaAuthorizerMiddleware);
app.get("/", (req, res, next) => {
  return res.status(200).json({
    message: "Hello from root!",
  });
});

app.use(statusRoutes);

app.get("/misc", (req, res, next) => {
  return res.status(200).json({
    headers: req.headers,
    "req.user": req.user
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
