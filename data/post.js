import {post} from "../config/mongoCollection";
import {user} from "../config/mongoCollection";
import {location} from "../config/mongoCollection";
import {ObjectId} from "mongodb";
import vaidation from "../validation";

// Import AWS SDK
import AWS from 'aws-sdk';
import fs from 'fs';

const AWS_ACCESS_KEY_ID = 'AKIAZTNDQJ645M3YCGGY';
const AWS_SECRET_ACCESS_ID = '+9Oy/Dtz//0rXE92N2NwwntNPV1wAZY2IFCEbl+t';
const bucketName = 'cs545project';

// Create an S3 instance
const s3 = new AWS.S3();

// Configure the AWS region and credentials
AWS.config.update({ region: 'us-east-1' }); 
AWS.config.update({ accessKeyId: AWS_ACCESS_KEY_ID, secretAccessKey: AWS_SECRET_ACCESS_ID }); 

/**
 * @param {ObjectId} _id - the unique id of the post
 * @param {string} user_id - the unique id of user of this post
 * @param {string} species - the species of the animal
 * @param {String} gender - the gender of the animal
 * @param {String} health_condition - the health condition
 * @param {String} description
 * @param {String} found_datatime - the latest date found
 * @param {String} photo_url - the URL of the photo
 * @param {String} location_id - the id of the location
 */


const createPost = async (
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

        photo_url = createURL(photo_url)

        // save post to database
        const singlePost = {
            user_id: user_id,
            species: species,
            health_condition: health_condition,
            description: description,
            found_datatime: datetime,
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
};


const removePostById = async (
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
};

const updatePost = async (
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

        // generate datetime
        const datetime = vaidation.generateCurrentDate();

        // update new photo
        if (photo_url !== null) {
            photo_url = createURL(photo_url);
        } else {
            
            // or use original photo
            const temp = await postCollection.findOne({_id: new ObjectId(post_id)});
            photo_url = temp.photo_url;
        }

        
        const postCollection = await post();
        const updatedPost = await postCollection.findOneAndUpdate(
            {_id: new ObjectId(post_id)},
            {
                $set: {
                    user_id: user_id,
                    species: species,
                    health_condition: health_condition,
                    description: description,
                    found_datatime: datetime,
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
};


const getPostByPostId = async (
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
};

const getPostByUserId = async (
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
};

const getAllPosts = async () => {
    try {
        const postCollection = await post();
        const allPosts = await postCollection.find({}).toArray();

        return allPosts;
    } catch (error) {
        throw error;
    }
};

const getLocationByPostId = async (
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
};

const createURL = async (filePath) => {

   // Read the file from the file system
   const fileContent = fs.readFileSync(filePath);

   // Generate a random string for the file name
   const randomString = Math.random().toString(36).substring(2, 15) 
                      + Math.random().toString(36).substring(2, 15);
   // Extract filename
   const originalFileName = filePath.split('/').pop();

   const currentFileName = randomString + '.' + originalFileName.slice(((originalFileName.lastIndexOf(".") - 1) >>> 0) + 2);

   // Setting up S3 upload parameters
   const params = {
       Bucket: bucketName,
       Key: currentFileName, // File name you want to save as in S3
       Body: fileContent
   };

   // Uploading files to the bucket
   s3.upload(params, function(err, data) {
       if (err) {
           console.log("Error", err);
         } else {
           console.log("Successfully uploaded file to S3");
           const url = `https://${bucketName}.s3.amazonaws.com/${currentFileName}`;
           console.log("File URL:", url);
         }
   });

    
};

export default {
    createPost,
    removePostById,
    updatePost,
    getPostByPostId,
    getPostByUserId,
    // getPostByEventId,
    getAllPosts,
    getLocationByPostId,
    createURL,
};