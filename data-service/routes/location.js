import express from "express";
import { postData, locationData } from "../data/index.js";
const router = express.Router();


router.route("/").get(async (req, res) => {
  try {
    const postList = await postData.getAllPosts();
    postList.map(async(post) => {
      const location = await locationData.getLocationById(post.location_id);
      post.location = location;
      return post;
    })
    // login
    if (postList === null) throw "Post not found.";
    res.status(200).json(postList);
    
  } catch (error) {
    res.status(400);
    return res.render("error", {
      errorMsg: error,
      login: true,
      title: "Error",
    });
  }
});

export default router;