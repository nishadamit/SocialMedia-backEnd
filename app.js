const express = require('express');
const cookieParser = require('cookie-parser');

const app = express()

const postRoutes = require("./routes/post");
const userRoutes = require("./routes/user");

if(process.env.NODE_ENV !== "production"){
    require('dotenv').config({ path: "./config/config.env" })
}

// apply middlewares
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

app.use("/post", postRoutes);
app.use("/user", userRoutes);

module.exports = app;