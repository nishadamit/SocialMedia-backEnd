const express = require("express");
const { 
    register, 
    login, 
    followOrUnfollow,
    logOut,
    updatePassword,
    updateProfile,
    deleteMyProfile,
    myProfile,
    getUserProfile,
    getAllUsers 
} = require("../controllers/user");
const { isAuthenticate } = require("../middlewares/auth");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logOut);
router.get("/followandunfollow/:id", isAuthenticate, followOrUnfollow);
router.put("/updatePassword",isAuthenticate, updatePassword);
router.put("/updateProfile",isAuthenticate, updateProfile);
router.delete("/delete/me", isAuthenticate, deleteMyProfile);
router.get("/myprofile", isAuthenticate, myProfile);
router.get("/profile/:id", isAuthenticate,getUserProfile);
router.get("/allusers", isAuthenticate, getAllUsers);

module.exports = router;