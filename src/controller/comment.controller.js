import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query;// req.qurey returns in string

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit); //this will convert them in number
    
    const skip = (pageNumber - 1 ) * limitNumber ;

     const comments = await Comment.find({videoId})
     .populate("owner" , "username avatar")//change object id of video with username and avatar
     .sort({createdAt: -1})//-1 means descending order of sort from new to old
     .skip(skip)
     .limit(limitNumber);

     const totalComments = await Comment.countDocuments({video: videoId});
     return res
     .status(200)
     .json({
        success: true,
        totalComments,
        currentPage: pageNumber,
        totalPages: Math.ceil(totalComments / limitNumber),
        comments
     })

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId} = req.params;
    const {content} = req.body;

    if (!content || content.trim() === "") {
        return res.status(400).json({
            success: false,
            message: "Comment content is required"
        });
    }

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user._id
    });

    return res.status(201).json(
        new ApiResponse(201, comment, "comment added successfully")
    );
});


const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }