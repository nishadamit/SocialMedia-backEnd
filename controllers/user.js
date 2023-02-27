const userModel = require("../models/User");
const postModel = require("../models/Post");

const register = async (req, res) =>{
     try {
        const {name, email, password}  =  req.body;
        let user  = await userModel.findOne({email});
        if(user){
            return res.status(400).json({success: false, message: "User already exists."})
        }

        user =  await userModel.create({
                                    name, 
                                    email, 
                                    password, 
                                    avatar: {public_id: "public id", url: "sample url"}
                                })

        const token = await user.generateToken();
        const cookieOptions = {
            expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            httpOnly: true
        }
        res.status(200).cookie("token", token, cookieOptions).json({success: true, user, token})
     } catch (error) {
        res.status(500).json({success: false, message: error.message})
     }
}

const login = async (req,res) =>{
    try {
        const {email, password} = req.body;
        const user = await userModel.findOne({email}).select("+password");
        if(!user){
            return res.status(400).json({success: false, message: "User Does not Exits."})
        }

        const isMatch = await user.matchPassword(password);

        if(!isMatch){
           return res.status(400).json({success: false, message: "Incorrect Password"})
        }
        const token = await user.generateToken();
        const cookieOptions = {
            expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            httpOnly: true
        }
        res.status(200).cookie("token", token, cookieOptions).json({success: true, user, token})
    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
}

const logOut = async (req, res) =>{
      try {
        let cookieOptions = {
            expires: new Date(Date.now()),
            httpOnly:  true
        }
        res.status(200).cookie("token",null, cookieOptions).json({success: true, message: "Logout Successfully!"})
      } catch (error) {
        res.status(400).json({success: false, message: error.message});
      }
}

const followOrUnfollow = async(req,res) =>{
    try {
        let message='';
        const userToFollow = await userModel.findById(req.params.id);
        const loggedInUser = await userModel.findById(req.user._id);

        if(!userToFollow){
            return res.status(400).json({success: false, message: "User not found!"});
        }

        let isAlreadyFollowed = userToFollow.followers.includes(loggedInUser._id);
        if(isAlreadyFollowed){
            let followingIndex = loggedInUser.following.indexOf(userToFollow._id);
            loggedInUser.following.splice(followingIndex,1);

            let followersIndex = userToFollow.followers.indexOf(loggedInUser._id);
            userToFollow.followers.splice(followersIndex, 1);

            message = "Unfollowed Successfully!"

        }else{
            loggedInUser.following.push(userToFollow._id);
            userToFollow.followers.push(loggedInUser._id);

            message = "Followed Successfully"
        }

        await loggedInUser.save();
        await userToFollow.save();

        res.status(200).json({success: true, message})
    } catch (error) {
        res.status(500).json({ success: false, message: error.message})
    }
}

const updatePassword = async(req, res) =>{
    try {
        const {oldPassword, newPassword} = req.body;
        if(!oldPassword || !newPassword){
            return res.status(400).json({success: false, message: "Please provide old and new password!."})
        }
        const user = await userModel.findById(req.user._id).select("+password");
        let ismatch = await user.matchPassword(oldPassword);
        if(!ismatch){
             return res.status(400).json({success: false, message:"Old password is incorrect!"});
        }
        user.password = newPassword;
        await user.save();
        res.status(200).json({success: true, message: "Password updated successfully!"})
    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }

}

const updateProfile = async(req, res) =>{
      try {
        const {name, email} = req.body;
        const user = await userModel.findById(req.user._id);
        if(name){
            user.name = name;
        }
        if(email){
            user.email = email;
        }

        await user.save();
        res.status(200).json({success: true, message: "Profile Updated Successfully!"})
      } catch (error) {
        res.status(500).json({success: false, message: error.message})
      }
}

const deleteMyProfile = async(req, res) =>{
         try {
            const user = await userModel.findById(req.user._id);
            const posts = user.posts;
            const followers = user.followers;
            const userId = user._id;
            const followings = user.following;
            console.log("followings")
            console.log(followings)

            await user.remove();

            res.cookie("token",null,{expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),httpOnly: true});

            for(let i = 0; i < posts.length ; i++){
                const post = await postModel.findById(posts[i]);
                await post.remove();
            }

            for (let i = 0 ; i < followers.length ; i++){
                const follower = await userModel.findById(followers[i]);
                const index = follower.following.indexOf(userId);
                follower.following.splice(index, 1);
                await follower.save();
            }

            for(let i = 0; i < followings.length; i++){
                const following = await userModel.findById(followings[i]);
                const index = following.followers.indexOf(userId);
                following.followers.splice(index,1);
                await following.save();
            }

            res.status(200).json({success: true, message: "Profile Deleted Successfully!"})
         } catch (error) {
            res.status(500).json({success: false, message: error.message})
         }
}

const myProfile = async(req,res) =>{
      try {
        const user = await userModel.findById(req.user._id).populate("posts");
        res.status(200).json({success: true, user})
      } catch (error) {
        res.status(500).json({success: false, message: error.message})
      }
}

const getUserProfile = async(req, res) =>{
      try {
        const user = await userModel.findById(req.params.id).populate("posts");
        if(!user){
            return res.status(404).json({success: false, message: "user not found."})
        }
        res.status(200).json({success: true, user})
      } catch (error) {
        res.status(500).json({success: false, message: error.message})
      }
}

const getAllUsers = async(req, res) =>{
    try {
        const users = await userModel.find({});
        res.status(200).json({success: false, users});
    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
}

module.exports = {
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
}