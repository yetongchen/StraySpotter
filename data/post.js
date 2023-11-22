import { post } from "../config/mongoCollection";
import { user } from "../config/mongoCollection";
import { ObjectId } from "mongodb";

const createPost = async(
    user_id,
    species,
    gender,
    health_condition,
    description,
    photo_url,
    location
) => {
    // validaiton

    // generate datetime

    // save post to database

    // save post_id to user collection

    // return created post object
}

export default {
    createPost,
    removePostById,
    updatePost,
    getPostByPostId,
    getPostByUserId,
    getPostByEventId,
    getAllPosts,
    getLocationByPostId,
};