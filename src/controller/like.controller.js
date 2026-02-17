import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video

    if(!isValidObjectId(videoId)){// isValidObjectId is a predefined function it help as to check if id i scorrect or not
        throw new ApiError(400, "invalid video id");
    }

    const existingLike = await Like.findOne({
        video: videoId,
        likedBy: req.user._id
    });
    console.log(existingLike);
    if(existingLike){
        await existingLike.deleteOne();

        return res 
        .status(200)
        .json(new ApiResponse(200, null, "video unliked successfully"));
    }  

    await Like.create({
        video : videoId,
        likedBy: req.user._id
    }); 
    return res
    .status(200)
    .json(new ApiResponse(200, null, "video liked successfully"));


})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment

    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "Invalid commentId ")
    }

    const existingLike = await Like.findOne({
        comment: commentId,
        likedBy: req.user._id
    });

    if(existingLike){
        await existingLike.deleteOne();

        return res.status(200)
        .json(new ApiResponse(200, null, "comment unliked successfully"));

    }  

    await Like.create({
        comment: commentId,
        likedBy: req.user._id
    });
    return res 
    .status(200)
    .json(new ApiResponse(200, null, "comment liked successfully"));

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
       if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    const existingLike = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user._id
    });

    if (existingLike) {
        await existingLike.deleteOne();

        return res
            .status(200)
            .json(new ApiResponse(200, null, "Tweet unliked successfully"));
    }

    await Like.create({
        tweet: tweetId,
        likedBy: req.user._id
    });

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Tweet liked successfully"));
});



const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
 const likedVideo = await Like.find({
    likedBy: req.user._id,
    video: {$exists: true}
 }).populate("video");

 return res
 .status(200)
 .json(new ApiResponse(200, likedVideo, "liked video fetched successfully"))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}