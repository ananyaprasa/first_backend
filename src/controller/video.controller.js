import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    
    page = parseInt(page);
    limit = parseInt(limit);

    const filter = {};

    if (query) {
        filter.title = { $regex: query, $options: "i" }; // case insensitive search
    }

    if (userId && isValidObjectId(userId)) {
        filter.owner = userId;
    }

    const sortOption = {};
    sortOption[sortBy] = sortType === "asc" ? 1 : -1;

    const skip = (page - 1) * limit;

    const videos = await Video.find(filter)
        .populate("owner", "username avatar")
        .sort(sortOption)
        .skip(skip)
        .limit(limit);

    const totalVideos = await Video.countDocuments(filter);

    return res.status(200).json(
        new ApiResponse(200, {
            totalVideos,
            currentPage: page,
            totalPages: Math.ceil(totalVideos / limit),
            videos
        }, "Videos fetched successfully")
    );
});




const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    if(!title || !description){
        throw new ApiError(400, "Title and description are required");

    }

    const videoLocalPath = req.files?.video?.[0]?.path;
    const thumbnailLocalPath = req.files?.video?.[0]?.path;

    if(!videoLocalPath || !thumbnailLocalPath){
        throw new ApiError(400, "video and thumbnail files are required");

    }

    const uploadedvideo = await uploadOnCloudinary(videoLocalPath);
    const uploadedThumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    const video = await Video.create({
        title,
        description,
        videoFile: uploadedvideo.url,
         thumbnail: uploadedThumbnail.url,
        owner: req.user._id,
        isPublished: true
    });

    return res.status(201).json(
        new ApiResponse(201, video, "Video published successfully")
    );
    })


const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid videoId")
    }

    const video = await Video.findById(videoId)
    .populate("owner ", "username avatar")
    if(!video){
        throw new ApiError(404,"Video not found")
    }

    return res 
    .status(200)
    .json(new ApiResponse(200, video, "video fetched successfully"));

   

})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "invalid videoId!!")
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404, "video not found")
    }

    if(video.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403, "YOU ARE NOT AUTHORIZED TO UPDATE THIS VIDEO!!")

    }

    if(req.file){
        const uploadedThumbnail = await uploadOnCloudinary(req.file.path);
        video.thumbnail = uploadedThumbnail.url;
    }
    video.title = title || video.title;
    video.description = description || video.description;

    await video.save();

    return res 
    .status(200)
    .json(new ApiResponse(200, video, "video details updated successfully"));

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    if(!isValidObjectId(videoId)){
        throw new ApiError(404,"INVALID id");
    }
    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404, "video not found");
    }

    if(video.owner.toString() !== req.user._id.toString())
    {
        throw new ApiError(403, "Not authorized")
    }

    await video.deleteOne();

     return res.status(200).json(
        new ApiResponse(200, null, "Video deleted successfully")
    );
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!isValidObjectId(videoId)){
        throw new ApiError(404, "Invalid ID")
    }

    const video =  await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Not authorized");
    }

    video.isPublished = !video.isPublished;
    await video.save();
    return res.status(200).json(
        new ApiResponse(200, video, "Publish status toggled successfully")
    );
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}