import express from "express";
import { postData, locationData } from "../data/index.js";
const router = express.Router();


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
    return res.status(400).json({error: e});
  }
});

export default router;