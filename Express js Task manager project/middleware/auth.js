//! middleware
const jwt = require("jsonwebtoken");
module.exports=function (req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(400).json({ message: "unauthorized" });
      return;
    }
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
      res.status(400).json({ message: "unauthorized" });
      return;
    } else {
      jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
        if (err) {
          res.status(400).json({ message: "unauthorized" });
        } else {
          req.payload = payload;
          next();
        }
      });
    }
  };

