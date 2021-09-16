const { Router } = require("express");

const router = Router();

router.get("/status/about", (req, res) => {
  return res.status(200).json({
    podName: "Hello from root!",
  });
});

module.exports = router;