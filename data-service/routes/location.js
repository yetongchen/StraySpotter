import express from "express";
import { postData, locationData } from "../data/index.js";
const router = express.Router();


router.route("/search").post(async (req, res) => {
  try {
    console.log(req.body.address);
    let result = await locationData.getPostsByAddress(req.body.address);
    return res.status(200).json(result);
  } catch (e) {
    return res.status(400).json({error: e});
  }
});

export default router;