const userModel = require("../models/User");
const jwt = require("jsonwebtoken");

const isAuthenticate = async (req, res, next) =>{
      const { token } = req.cookies
      if(!token){
        return res.status(401).json({message: "Please login first"})
      }

      const decoded = await jwt.verify(token, process.env.JWT_SECRET);
      const user = await userModel.findById(decoded._id);
      req.user = user;
      next()
}

module.exports = {
    isAuthenticate
}