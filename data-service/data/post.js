import {post} from "../config/mongoCollection.js";
import {user} from "../config/mongoCollection.js";
import locationData from "./location.js";
import {ObjectId} from "mongodb";
import validation from "../validation.js";

// Import AWS SDK
import AWS from 'aws-sdk';
import fs from 'fs';

const AWS_ACCESS_KEY_ID = 'AKIAZTNDQJ645M3YCGGY';
const AWS_SECRET_ACCESS_ID = '+9Oy/Dtz//0rXE92N2NwwntNPV1wAZY2IFCEbl+t';
const bucketName = 'cs545project';

// Configure the AWS region and credentials
AWS.config.update({
    region: 'us-east-1',
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_ID
  });

/**
 * @param {ObjectId} _id - the unique id of the post
 * @param {string} user_id - the unique id of user of this post
 * @param {string} species - the species of the animal
 * @param {String} gender - the gender of the animal
 * @param {String} health_condition - the health condition
 * @param {String} description
 * @param {String} found_datetime - the latest date found
 * @param {String} photo_url - the URL of the photo
 * @param {String} location_id - the id of the location
 */


const createPost = async (
    user_id,
    species,
    gender,
    health_condition,
    description,
    photo_url,
    address
) => {
    try {
        // validaiton
        user_id = validation.validateId(user_id);
        species = validation.validateSpecies(species);
        gender = validation.validateGender(gender);
        health_condition = validation.validateHealthCondition(health_condition);

        description = validation.validateDescription(description);
        
        // generate datetime
        const datetime = validation.generateCurrentDate();
        
        
        if (validation.isValidUrl(photo_url)) {
            photo_url = photo_url;
        } else if (!photo_url || photo_url === 'nan') {
            photo_url = `https://${bucketName}.s3.amazonaws.com/default.jpg`;
        } else if(typeof photo_url === 'string'){
            photo_url = await createURLByPath(photo_url);
        } else {
            photo_url = await createURLByFile(photo_url);
        }

        // save post to database
        const singlePost = {
            user_id: user_id,
            species: species,
            gender: gender,
            health_condition: health_condition,
            description: description,
            found_datetime: datetime,
            photo_url: photo_url,
            location_id: null
        };

      
        try {
            let any = await locationData.convertLocation(address);
        } catch (error) {
            console.log(any);
            throw error;
        }
  
        const postCollection = await post();
        const insertInfo = await postCollection.insertOne(singlePost);
        if (!insertInfo.acknowledged || !insertInfo.insertedId) throw "Could not add user.";

        console.log(address);

        const location = await locationData.createLocation(address, insertInfo.insertedId.toString());
        const updatedInfo = await postCollection.updateOne(
            { _id: insertInfo.insertedId },
            { $set: { location_id: location._id } }
          );
          if (!updatedInfo) throw "location_id update failed";

        // save post_id to user collection

  
        const userCollection = await user();

        const updatedUser = await userCollection.findOneAndUpdate(
            {_id: user_id},
            {$addToSet: {posts: insertInfo.insertedId.toString()}},
            {returnDocument: 'after'} // to get the updated document
        );
      
        if (!updatedUser) {
            throw "Could not find or update user with post information.";
        }
  
        // return created post object
        const createdPost = getPostByPostId(insertInfo.insertedId.toString());
        return createdPost;
    } catch (error) {
        throw error;
    }
};


const removePostById = async (
    post_id
) => {
    try {
        post_id = validation.validateId(post_id);

        // remove location
        const oldPost = await getPostByPostId(post_id);
        const removeOldLocation = await locationData.removeLocationByPostId(post_id, oldPost.location_id);
        if (! removeOldLocation)   throw "Could not remove old location while updating the post.";

        const userCollection = await user();
        await userCollection.updateOne(
            {_id: oldPost.user_id},
            {$pull: {posts: post_id}}
        );
        
        const postCollection = await post();
        const deletedPost = await postCollection.findOneAndDelete({_id: new ObjectId(post_id)});

        if (!deletedPost) {
            throw "Could not find or delete the post.";
        }
        deletedPost._id = deletedPost._id.toString();
        return deletedPost;
    } catch (error) {
        throw error;
    }
};

const updatePost = async (
    post_id,
    species,
    gender,
    health_condition,
    description,
    photo_url,
    address
) => {
    try {
        // validation
        post_id = validation.validateId(post_id);
        species = validation.validateSpecies(species);
        gender = validation.validateGender(gender);
        health_condition = validation.validateHealthCondition(health_condition);
        description = validation.validateDescription(description);

        // delete old location and generate new location object
        const oldPost = await getPostByPostId(post_id);
        const removeOldLocation = await locationData.removeLocationByPostId(post_id, oldPost.location_id);
        if (! removeOldLocation)   throw "Could not remove old location while updating the post.";
        const location = await locationData.createLocation(address, post_id);
        const location_id = location._id;

        // generate datetime
        //const datetime = validation.generateCurrentDate();

        const postCollection = await post();

        // update new photo
        if (photo_url !== null && photo_url !== undefined) {
            console.log(photo_url);
            console.log(photo_url !== null);
            if (typeof photo_url === 'string') {
                photo_url = await createURLByPath(photo_url);
            } else {
                photo_url = await createURLByFile(photo_url);
            }
        } else {        
            // or use original photo
            const temp = await postCollection.findOne({_id: new ObjectId(post_id)});
            photo_url = temp.photo_url;
        }

        const updatedPost = await postCollection.findOneAndUpdate(
            {_id: new ObjectId(post_id)},
            {
                $set: {
                    user_id: oldPost.user_id,
                    species: species,
                    gender: gender,
                    health_condition: health_condition,
                    description: description,
                    found_datetime: oldPost.found_datetime,
                    photo_url: photo_url,
                    location_id: location_id,
                },
            },
            {returnDocument: 'after'}
        );

        if (!updatedPost) {
            throw "Could not find or update the post.";
        }
        updatedPost._id = updatedPost._id.toString();
        return updatedPost;
    } catch (error) {
        throw error;
    }
};

const getPostByPostId = async (
    post_id
) => {
    try {
        post_id = validation.validateId(post_id);

        const postCollection = await post();
        const foundPost = await postCollection.findOne({ _id: new ObjectId(post_id) });

        if (!foundPost) throw "Post not found.";

        foundPost._id = foundPost._id.toString();

        return foundPost;
    } catch (error) {
        throw error;
    }
};

const getPostByUserId = async (
    user_id
) => {
    try {
        user_id = validation.validateId(user_id);

        const postCollection = await post();
        let posts = await postCollection.find({ user_id: user_id }).toArray();
        posts = posts.map((p) => {
            p._id = p._id.toString();
            return p;
        });

        return posts;
    } catch (error) {
        throw error;
    }
};

const getAllPosts = async () => {
    try {
        const postCollection = await post();
        let allPosts = await postCollection.find({}).toArray();
        allPosts = allPosts.map((p) => {
            p._id = p._id.toString();
            return p;
        });

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
        post_id = validation.validateId(post_id);

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

const createURLByPath = async (filePath) => {

    // Create an S3 instance
    const s3 = new AWS.S3();

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

    return new Promise((resolve, reject) => {
        s3.upload(params, function(err, data) {
            if (err) {
                console.log("Error", err);
                reject(err);
            } else {
                console.log("Successfully uploaded file to S3");
                const url = `https://${bucketName}.s3.amazonaws.com/${currentFileName}`;
                console.log("File URL:", url);
                resolve(url);
            }
        });
    });
};

const createURLByFile = async (file) => {

    // Create an S3 instance
    const s3 = new AWS.S3();

    // Generate a random string for the file name
    const randomString = Math.random().toString(36).substring(2, 15) 
                        + Math.random().toString(36).substring(2, 15);

    const filenameParts = file.originalname.split('.');
    const extension = filenameParts[filenameParts.length - 1];

    const currentFileName = randomString + '.' + extension;

    const fileContent = file.buffer;

    // Setting up S3 upload parameters
    const params = {
        Bucket: bucketName,
        Key: currentFileName, // File name you want to save as in S3
        Body: fileContent
    };

    return new Promise((resolve, reject) => {
        s3.upload(params, function(err, data) {
            if (err) {
                console.log("Error", err);
                reject(err);
            } else {
                console.log("Successfully uploaded file to S3");
                const url = `https://${bucketName}.s3.amazonaws.com/${currentFileName}`;
                console.log("File URL:", url);
                resolve(url);
            }
        });
    });
};

export default {
    createPost,
    removePostById,
    updatePost,
    getPostByPostId,
    getPostByUserId,
    getAllPosts,
    getLocationByPostId,
    createURLByPath,
    createURLByFile
};
