const express = require("express");

const { 
    createPost, 
    likeOrUnlike,
    deletePost,
    getPostOfFollowing,
    updateCaption,
 } = require("../controllers/post");
const { isAuthenticate } = require("../middlewares/auth");

const router = express.Router();

router.post('/upload',isAuthenticate,createPost);
router.get('/like/:id', isAuthenticate, likeOrUnlike);
router.delete('/delete/:id', isAuthenticate, deletePost);
router.get('/postOfFollowing', isAuthenticate, getPostOfFollowing);
router.put('/updatecaption/:id',isAuthenticate, updateCaption);


module.exports = router;