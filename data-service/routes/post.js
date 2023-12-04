import express from "express";
import { postData, locationData } from "../data/index.js";
import validation from "../validation.js";

import multer from "multer";
const router = express.Router();
const upload = multer();

router.route("/").get(async (req, res) => {
  try {
    let postList = await postData.getAllPosts();
    for (let i = 0; i < postList.length; i++){
      let location = await locationData.getLocationById(postList[i].location_id);
      postList[i].location = location;
    }
    if (postList === null) throw "Post not found.";
    return res.status(200).json(postList);
  } catch (e) {
    return res.status(500).json({error: e});
  }
});

router.route("/new").post(upload.any(), async (req, res) => {

    let photo_url = null;

    try {
        photo_url = req.files.find(file => file.fieldname === 'photo_url');
        req.body.user_id = validation.validateId(req.body.user_id);
        req.body.species = validation.validateSpecies(req.body.species);
        req.body.gender = validation.validateGender(req.body.gender);
        req.body.health_condition = validation.validateHealthCondition(req.body.health_condition);
        req.body.description = validation.validateDescription(req.body.description);

    } catch(e) {
        return res.status(400).json({error: e});
    }
    try {
        let new_post = await postData.createPost(
            req.body.user_id,
            req.body.species,
            req.body.gender,
            req.body.health_condition,
            req.body.description,
            photo_url,
            req.body.address
        );
        res.status(200).json(new_post);
    } catch (e) {
        return res.status(500).json({error: e});
    }
});

router.route("/:id")
    .get(async (req, res) => {
        try {
            req.params.id = validation.validateId(req.params.id);
        } catch (e) {
            return res.status(400).json({error: e});
        }
        try {
            let post = await postData.getPostByPostId(req.params.id);
            let location = await locationData.getLocationById(post.location_id);
            post.location = location;
            return res.status(200).json(post);
        } catch (e) {
            return res.status(500).json({error: e});
        }
    })
    .delete(async (req, res) => {
        try {
            req.params.id = validation.validateId(req.params.id);
        } catch (e) {
            return res.status(400).json({error: e});
        }
        try {
            let post = await postData.removePostById(req.params.id);
            return res.status(200).json(post);
        } catch (e) {
            return res.status(500).json({error: e});
        }
 
    })
    .post(async (req, res) => {
        try {
            req.params.post_id = validation.validateId(req.params.post_id);
            req.body.species = validation.validateSpecies(req.body.species);
            req.body.gender = validation.validateGender(req.body.gender);
            req.body.health_condition = validation.validateHealthCondition(req.body.health_condition);
            req.body.description = validation.validateDescription(req.body.description);
        } catch(e) {
            return res.status(400).json({error: e});
        }
        try {
            let new_post = await postData.updatePost(
                req.params.post_id,
                req.body.species,
                req.body.gender,
                req.body.health_condition,
                req.body.description,
                req.body.photo_url,
                req.body.address
            );
            res.status(200).json(new_post);
        } catch (e) {
            return res.status(500).json({error: e});
        }
    });



router.route("/user/:id").get(async (req, res) => {

    try {
        req.params.id = validation.validateId(req.params.id);
    } catch (e) {
        return res.status(400).json({error: e});
    }
    try {
        let postList = await postData.getPostByUserId(req.params.id);
        for (let i = 0; i < postList.length; i++){
            let location = await locationData.getLocationById(postList[i].location_id);

            postList[i].location = location;
        }
        if (postList === null) throw "Post not found.";
        return res.status(200).json(postList);
    } catch (e) {
        return res.status(500).json({error: e});
    }
});


export default router;