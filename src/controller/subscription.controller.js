import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    if(!isValidObjectId(channelId)){
        throw new ApiError(400, "Invalid channel ID")
    }

    if (channelId === req.user._id.toString())
    {
        throw new ApiError(400, "You cannot subscribe to yourself");
    }
    const existingSubscription = await Subscription.findOne({
        subscribe: req.user._id,
        channel: channelId
    });
    if(existingSubscription){
        await existingSubscription.deleteone();

        return res.status(200).json(
            new ApiResponse(200, null, "Unsubscibred Successfully")
        );
    }
    await Subscription.create({
        subscribe: req.user._id,
        channel: channelId
    })
    return res.status(200)
    .json(new ApiResponse(200, null, "Subscribed successfully"))
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    const subscribers = await Subscription.find({ channel: channelId })
        .populate("subscriber", "username avatar");

    return res.status(200).json(
        new ApiResponse(200, subscribers, "Subscribers fetched successfully")
    );
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;
      if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriber ID");
    }

    const channels = await Subscription.find({ subscriber: subscriberId })
        .populate("channel", "username avatar");

    return res.status(200).json(
        new ApiResponse(200, channels, "Subscribed channels fetched successfully")
    );
    
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}