import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema =new mongoose.Schema(
    {
        videoFile : {
            type : String, //cloudniary url
            required : true,
        },
        thumbnail : {
            type : String, //cloudniary url
            required : true
        },
        videoUploader : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "User"
        },
        title : {
            type : String,
            required : true
        },
        description : {
            type : String,
            required : true
        },
        duration : {
            type : Number,
            required : true
        },
        views : {
            type : Number,
            default : 0,
        },
        isPUblised : {
            type : Boolean,
            default : true,
        }
    },{timestamps : true})

videoSchema.plugin(mongooseAggregatePaginate)
export const Video = mongoose.model("Video",videoSchema)