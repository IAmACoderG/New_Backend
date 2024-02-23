import mongoose from "mongoose";
import { aggregatePaginate } from "mongoose-aggregate-paginate-v2";

const videoSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    videoFile: {
        type: String, // Cloudinary Url ...>>>
        required: true
    },
    thambnail: {
        type: String, //Cloudinary Url ...>>>
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    views: {
        type: Number,
        default: 0
    },
    isPublished: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

videoSchema.plugin(aggregatePaginate);
export const Video = mongoose.model("Video", videoSchema);