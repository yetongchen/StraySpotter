import {post} from "../config/mongoCollection";
import {user} from "../config/mongoCollection";
import {location} from "../config/mongoCollection";
import {ObjectId} from "mongodb";
import vaidation from "../validation";

export const createPost = async (
    user_id,
    species,
    health_condition,
    description,
    photo_url,
    location_id
) => {
    try {
        // validaiton
        user_id = vaidation.validateId(user_id);
        species = vaidation.validateSpecies(species);
        health_condition = vaidation.validateHealthCondition(health_condition);
        description = vaidation.validateDescription(description);
        location_id = vaidation.validateLocation(location_id);

        // generate datetime
        const datetime = vaidation.generateCurrentDate();

        // save post to database
        const singlePost = {
            user_id: user_id,
            species: species,
            health_condition: health_condition,
            description: description,
            photo_url: photo_url,
            location_id: location_id
        };
        const postCollection = await post();
        const insertInfo = await postCollection.insertOne(singlePost);
        if (!insertInfo.acknowledged || !insertInfo.insertedId) throw "Could not add user.";


        // save post_id to user collection
        const userCollection = await user();

        const updatedUser = await userCollection.findOneAndUpdate(
            {_id: new ObjectId(user_id)},
            {$addToSet: {posts: insertInfo.insertedId}},
            {returnDocument: 'after'} // to get the updated document
        );

        if (!updatedUser.value) {
            throw "Could not find or update user with post information.";
        }

        // return created post object
        const createdPost = {
            _id: insertInfo.insertedId,
            ...singlePost,
        };
        return createdPost;
    } catch (error) {
        throw error;
    }
}


export const removePostById = async (
    post_id
) => {
    try {
        post_id = vaidation.validateId(post_id);

        const postCollection = await post();
        const deletedPost = await postCollection.findOneAndDelete({_id: new ObjectId(post_id)});

        if (!deletedPost.value) {
            throw "Could not find or delete the post.";
        }

        const userCollection = await user();
        await userCollection.updateOne(
            {_id: new ObjectId(deletedPost.value.user_id)},
            {$pull: {posts: new ObjectId(post_id)}}
        );

        return deletedPost.value;
    } catch (error) {
        throw error;
    }
}

export const updatePost = async (
    post_id,
    user_id,
    species,
    health_condition,
    description,
    photo_url,
    location_id
) => {
    try {
        // validation
        post_id = vaidation.validateId(post_id);
        user_id = vaidation.validateId(user_id);
        species = vaidation.validateSpecies(species);
        health_condition = vaidation.validateHealthCondition(health_condition);
        description = vaidation.validateDescription(description);
        location_id = vaidation.validateLocation(location_id);

        const postCollection = await post();
        const updatedPost = await postCollection.findOneAndUpdate(
            {_id: new ObjectId(post_id)},
            {
                $set: {
                    user_id: user_id,
                    species: species,
                    health_condition: health_condition,
                    description: description,
                    photo_url: photo_url,
                    location_id: location_id,
                },
            },
            {returnDocument: 'after'}
        );

        if (!updatedPost.value) {
            throw "Could not find or update the post.";
        }

        return updatedPost.value;
    } catch (error) {
        throw error;
    }
}


export const getPostByPostId = async (
    post_id
) => {
    try {
        post_id = vaidation.validateId(post_id);

        const postCollection = await post();
        const foundPost = await postCollection.findOne({ _id: new ObjectId(post_id) });

        if (!foundPost) {
            throw "Post not found.";
        }

        return foundPost;
    } catch (error) {
        throw error;
    }
}

export const getPostByUserId = async (
    user_id
) => {
    try {
        user_id = vaidation.validateId(user_id);

        const postCollection = await post();
        const posts = await postCollection.find({ user_id: user_id }).toArray();

        return posts;
    } catch (error) {
        throw error;
    }
}

export const getAllPosts = async () => {
    try {
        const postCollection = await post();
        const allPosts = await postCollection.find({}).toArray();

        return allPosts;
    } catch (error) {
        throw error;
    }
}

export const getLocationByPostId = async (
    post_id
) => {
    try {
        // validation
        post_id = vaidation.validateId(post_id);

        const postCollection = await post();
        const foundPost = await postCollection.findOne({ _id: new ObjectId(post_id) });

        if (!foundPost) {
            throw "Post not found.";
        }

        const location_id = foundPost.location_id;

        const locationCollection = await location(); // Replace 'location()' with the actual function to get the location collection
        const locationInfo = await locationCollection.findOne({ _id: new ObjectId(location_id) });

        if (!locationInfo) {
            throw "Location not found.";
        }

        return locationInfo;
    } catch (error) {
        throw error;
    }
}
export default {
    createPost,
    removePostById,
    updatePost,
    getPostByPostId,
    getPostByUserId,
    // getPostByEventId,
    getAllPosts,
    getLocationByPostId,
};