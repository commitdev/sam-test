const serverless = require("serverless-http");
const express = require("express");
const app = express();
const pgp = require('pg-promise')(/* options */)
const db = pgp(`postgres://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:5432/${process.env.DB_DATABASE}`)
const AWSXRay = require('aws-xray-sdk')
const morgan = require("morgan");

console.log("TEST: ^" + process.env.DB_DATABASE + "$");

app.use(morgan("combined"));
app.use(AWSXRay.express.openSegment('BillTestApp'));

app.get("/", (req, res, next) => {
  return res.status(200).json({
    message: "Hello from root!",
  });
});

app.get("/error", (req, res, next) => {
  throw new Error("Test error");
});

app.get("/long", (req, res, next) => {
    return setTimeout(() => {
        res.status(200).json({message: "Long request complete after 2s"})
    }, 2000);
});


app.get("/flaky", (req, res, next) => {
  var timeout = Math.floor(Math.random() * 2000);
  return setTimeout(() => {
    if (timeout > 1000) {
      res.status(200).json({message: "Flaky request complete after " + timeout + "ms"})
    } else {
      res.status(500).json({message: "Flaky request failed after " + timeout + "ms"})
    }
  }, 2000);
});

app.get("/hello", (req, res, next) => {
  return res.status(200).json({
    message: "Hello from path! TEST: ^" + process.env.DB_DATABASE + "$",
  });
});

app.get("/db", (req, res, next) => {
  return db.one('SELECT $1 AS value', 123)
    .then(function (data) {
      console.log('DATA:', data.value)
      return res.status(200).json({
        message: "DB test: ^" + data.value + "$",
      });
    })
    .catch(function (error) {
      console.log('ERROR:', error)
      return res.status(200).json({
        message: "DB error: ^" + error + "$",
      });
    })

});



app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

app.use(AWSXRay.express.closeSegment());

module.exports.core = app;
module.exports.lambdaHandler = serverless(app);
