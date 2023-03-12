const express = require("express");

const { 
    createPost, 
    likeOrUnlike,
    deletePost,
    getPostOfFollowing,
    updateCaption,
    commentOnPost
 } = require("../controllers/post");
const { isAuthenticate } = require("../middlewares/auth");

const router = express.Router();

router.post('/upload',isAuthenticate,createPost);
router.get('/like/:id', isAuthenticate, likeOrUnlike);
router.delete('/delete/:id', isAuthenticate, deletePost);
router.get('/postOfFollowing', isAuthenticate, getPostOfFollowing);
router.put('/updatecaption/:id',isAuthenticate, updateCaption);
router.put('/commentOnPost/:id', isAuthenticate, commentOnPost);


module.exports = router;