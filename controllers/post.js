const postModel = require("../models/Post");
const userModel = require("../models/User");

const createPost = async(req, res) =>{
           try {
               const newPostData = {
                    caption: req.body.caption,
                    image: {
                        public_id: "req.body.public_id",
                        url: "req.body.url"
                    },
                    owner: req.user._id
               }

               const post = await postModel.create(newPostData);
               const user = await userModel.findById(req.user._id);
               user.posts.push(post._id);
               await user.save();
               res.status(201).json({success: true, post})
           } catch (error) {
               res.status(500).json({success: false, message: error.message})
           }
}

const deletePost = async (req, res) =>{
    try {
        const post = await postModel.findById(req.params.id);
        if(!post){
            return res.status(404).json({success: false, message: 'Post not found!'})
        }

        if(post.owner.toString() !== req.user._id.toString()){
            return res.status(401).json({success: false, message: "Unauthorised!"})
        }

        await post.remove();

        const user = await userModel.findById(req.user._id);
        const index = user.posts.indexOf(req.params.id);
        user.posts.splice(index,1);
        await user.save();
        res.status(200).json({success: false, message: "Post deleted successfully!"})
    } catch (error) {
        res.status(400).json({success: false, message: error.message})
    }
}

const likeOrUnlike = async (req,res) =>{
         try {
            const post = await postModel.findById(req.params.id);
            if(!post){
                return res.status(404).json({success: true, message: "Post Not Found"});
            }

            const userId = req.user._id;     
            let liked = post.likes.map(like =>  userId.toString() === like._id.toString())[0];

            if(liked){
                const index = post.likes.indexOf(userId);
                post.likes.splice(index,1);
                await post.save();
                return res.status(200).json({success: true, message: "Post Unliked"})

            }else{
                post.likes.push(userId);
                post.save();
                return res.status(200).json({success: true, message: "Post Liked"});
            }
         } catch (error) {
            res.status(500).json({success: false, message: error.message});
         }
}

const getPostOfFollowing = async(req,res) =>{
      try {
        const user = await userModel.findById(req.user._id);
        const posts = await postModel.find({
            owner:{
                $in: user.following
            }
        })
        res.status(200).json({success: true, posts})
        
        
      } catch (error) {
        res.status(400).json({success: false, message: error.message});
      }
}

const updateCaption = async(req, res) =>{
       console.log("update caption called")
       try {
        const post = await postModel.findById(req.params.id);
        if(!post){
            return res.status(401).json({success: false, message: "Post not found"})
        }
        if(post.owner.toString() !== req.user._id.toString()){
            return res.status(401).json({success: false, message:"Unauthorized"})
        }
        post.caption = req.body.caption
        post.save()
        res.status(200).json({success: false, message: "Post Updated Successfully"})
       } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
       }
}

const commentOnPost = async(req, res) =>{
        try {
            const post = await postModel.findById(req.params.id);
            if(!post){
                return res.status(400).json({success: false, message: "Post not found"})
            }
            let commentIndex = -1;
            post.comments.forEach((comment,index) =>{
                if(comment.user.toString() === req.user._id.toString()){
                    commentIndex = index;
                }
            })

            if(commentIndex !== -1){
               post.comments[commentIndex].comment = req.body.comment;
            }else{
               post.comments.push({user: req.user._id, comment: req.body.comment})
            }

            await post.save();
            return res.status(200).json({success: true, message: "Comment Updated Successfully!"})

        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            })
        }
}

const deleteComment = async(req,res) =>{
    try {
        let comment = "";
        const { commentId } = req.body;
        const post = await postModel.findById(req.params.id);
        if(!post){
            return res.status(400).json({success: false, message: "Post not found"})
        }

        // if user wants to delete his own coment
        console.log(req.user._id.toString())

        if(post.owner.toString() === req.user._id.toString()){
             console.log("inside if")
            if(!commentId){
                return res.status(400).json({success: false, message: "Comment Id is required."})
            }

            post.comments.forEach((item, index) =>{
                if(item._id.toString() === commentId.toString()){
                    return post.comments.splice(index, 1)
                }
            })
            comment = "Selected Comment has deleted!"
        }else{
            console.log("inside else")
            post.comments.forEach((item, index) =>{
                if(item.user.toString() === req.user._id.toString()){
                    return post.comments.splice(index, 1)
                }
            })
            comment = "Comment deleted Successfully"
        }

        await post.save();
        res.status(200).json({success: true, message: comment})
    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
}

module.exports = {
    createPost,
    likeOrUnlike,
    deletePost,
    getPostOfFollowing,
    updateCaption,
    commentOnPost,
    deleteComment
}